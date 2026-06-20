import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Service to handle Authentication logic, validation, and token signing.
 * Decoupled from HTTP request/response context for unit-test ease.
 */
export class AuthService {
  /**
   * Validates if a password meets complexity rules (min 6 characters, uppercase, lowercase, and numeric).
   * 
   * @param {string} password - Input password
   * @returns {Object} { isValid, message }
   */
  static validatePassword(password) {
    if (typeof password !== 'string') {
      return { isValid: false, message: 'Password must be a valid string.' };
    }

    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long.' };
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return { 
        isValid: false, 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.' 
      };
    }

    return { isValid: true, message: 'Password is valid.' };
  }

  /**
   * Generates a signed JWT access token.
   * 
   * @param {string} userId - User ID
   * @param {string} username - Username
   * @returns {string} Signed JWT token
   */
  static signToken(userId, username) {
    return jwt.sign(
      { id: userId, username },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
  }
}
