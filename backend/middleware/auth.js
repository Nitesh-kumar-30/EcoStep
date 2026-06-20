import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Authentication middleware verifying JWT tokens for API requests.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded; // Contains id and username
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

export default authMiddleware;
