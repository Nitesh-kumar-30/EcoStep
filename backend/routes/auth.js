import express from 'express';
import bcrypt from 'bcryptjs';
import { DB } from '../database.js';
import authMiddleware from '../middleware/auth.js';
import { AuthService } from '../services/authService.js';

const router = express.Router();

// Basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields.' });
    }

    // Input validations
    if (username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long.' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    // Delegate password strength evaluation to AuthService
    const passwordValidation = AuthService.validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Check if user already exists
    const userExists = await DB.users.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Hash Password with high-round salt
    const salt = await bcrypt.genSalt(12); // High rounds for security
    const passwordHash = await bcrypt.hash(password, salt);

    // Create User
    const newUser = await DB.users.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: passwordHash,
    });

    // Delegate token signing to AuthService
    const token = AuthService.signToken(newUser._id, newUser.username);

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        ecoPoints: newUser.ecoPoints,
        treesPlanted: newUser.treesPlanted,
      }
    });

  } catch (err) {
    next(err); // Centralized error handling
  }
});

// @route   POST /api/auth/login
// @desc    Login existing user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields.' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    // Find User
    const user = await DB.users.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User does not exist.' });
    }

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    // Delegate token signing to AuthService
    const token = AuthService.signToken(user._id, user.username);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        ecoPoints: user.ecoPoints,
        treesPlanted: user.treesPlanted,
      }
    });

  } catch (err) {
    next(err);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user details
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await DB.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      ecoPoints: user.ecoPoints,
      treesPlanted: user.treesPlanted,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
