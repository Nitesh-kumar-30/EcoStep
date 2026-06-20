import { config } from '../config/index.js';

/**
 * Global centralized Express error handling middleware.
 * Guarantees standard API error structures and hides sensitive debug traces in production.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = config.nodeEnv === 'production';

  console.error(`[Error Handler] ${req.method} ${req.url} - Error:`, err.message || err);
  if (err.stack && !isProduction) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    message: err.message || 'An internal server error occurred.',
    ...(isProduction ? {} : { stack: err.stack, details: err })
  });
};

export default errorHandler;
