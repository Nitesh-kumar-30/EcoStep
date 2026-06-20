/**
 * Security Middleware providing XSS protection, rate limiting, and secure HTTP headers.
 * Implemented completely in-house with zero external dependency requirements.
 */

// Simple in-memory storage for Rate Limiting
const rateLimitCache = new Map();

// Clean cache periodically to prevent memory leak (runs every 5 mins)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitCache.entries()) {
    if (now > record.resetTime) {
      rateLimitCache.delete(ip);
    }
  }
}, 300000);

/**
 * Custom Rate Limiting middleware.
 * Limits IP addresses to a max number of requests in a specified time window.
 */
export const rateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // Default 15 minutes
    max = 200, // Max requests per windowMs
    message = 'Too many requests from this IP. Please try again after 15 minutes.'
  } = options;

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    let record = rateLimitCache.get(ip);

    if (!record) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimitCache.set(ip, record);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      return next();
    }

    if (now > record.resetTime) {
      // Window elapsed, reset count
      record.count = 1;
      record.resetTime = now + windowMs;
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      return next();
    }

    record.count++;
    const remaining = Math.max(0, max - record.count);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      return res.status(429).json({ message });
    }

    next();
  };
};

/**
 * Middleware setting standard security-related HTTP headers.
 * Replaces 'helmet' package functionalities with zero dependencies.
 */
export const securityHeaders = (req, res, next) => {
  // Prevent clickjacking attacks by forbidding framing
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent browser MIME-type sniffing vulnerabilities
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enforce XSS protection in legacy browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict Transport Security (HSTS) if connection is HTTPS
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

  // Custom Content Security Policy (CSP) - allows scripts/styles from verified hosts
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' http://localhost:5000 https://generativelanguage.googleapis.com"
  );

  next();
};

/**
 * Sanitizes input strings against HTML tag injections and trims values.
 */
const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    return val
      .trim()
      .replace(/<[^>]*>/g, '') // Basic HTML tag strip
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  if (typeof val === 'object' && val !== null) {
    // Recurse into object
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        val[key] = sanitizeValue(val[key]);
      }
    }
  }
  return val;
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  next();
};

/**
 * Recursively removes keys starting with '$' to prevent NoSQL query injections.
 */
const cleanNoSql = (val) => {
  if (typeof val === 'object' && val !== null) {
    if (Array.isArray(val)) {
      val.forEach((item, index) => {
        val[index] = cleanNoSql(item);
      });
    } else {
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          if (key.startsWith('$')) {
            delete val[key];
          } else {
            val[key] = cleanNoSql(val[key]);
          }
        }
      }
    }
  }
  return val;
};

export const preventNoSqlInjection = (req, res, next) => {
  if (req.body) req.body = cleanNoSql(req.body);
  if (req.query) req.query = cleanNoSql(req.query);
  if (req.params) req.params = cleanNoSql(req.params);
  next();
};

/**
 * Standardizes query parameters by converting arrays (caused by duplicate query keys)
 * to single values (taking the first parameter). Prevents HTTP Parameter Pollution (HPP).
 */
export const preventParameterPollution = (req, res, next) => {
  if (req.query) {
    for (const key in req.query) {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        if (Array.isArray(req.query[key])) {
          req.query[key] = req.query[key][0]; // Keep first item only
        }
      }
    }
  }
  next();
};
