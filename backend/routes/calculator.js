import express from 'express';
import { DB } from '../database.js';
import authMiddleware from '../middleware/auth.js';
import { CalculatorService } from '../services/calculatorService.js';

const router = express.Router();

// @route   POST /api/calculator
// @desc    Calculate and save a new footprint entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { transport, energy, food, waste } = req.body;

    if (!transport || !energy || !food || !waste) {
      return res.status(400).json({ message: 'Missing calculator fields.' });
    }

    const { totalEmissions, breakdown } = CalculatorService.calculate({ transport, energy, food, waste });

    const newFootprint = await DB.footprints.create(req.user.id, {
      transport,
      energy,
      food,
      waste,
      totalEmissions
    });

    // Award 50 eco-points for logging carbon footprint
    const updatedUser = await DB.users.addPoints(req.user.id, 50);

    res.status(201).json({
      footprint: newFootprint,
      breakdown,
      userPoints: updatedUser ? updatedUser.ecoPoints : 0,
      message: 'Carbon footprint logged successfully! You earned 50 eco-points! 🌱'
    });

  } catch (err) {
    console.error('Carbon calculation error:', err);
    res.status(500).json({ message: 'Server error saving carbon footprint.' });
  }
});

// @route   GET /api/calculator/history
// @desc    Get user footprint history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await DB.footprints.getByUserId(req.user.id);
    res.json(history);
  } catch (err) {
    console.error('Fetch carbon history error:', err);
    res.status(500).json({ message: 'Server error fetching history.' });
  }
});

export default router;
