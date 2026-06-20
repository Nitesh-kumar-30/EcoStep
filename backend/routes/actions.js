import express from 'express';
import { DB } from '../database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/actions/challenges
// @desc    Get all daily challenges and which ones are completed by the user today
router.get('/challenges', authMiddleware, async (req, res, next) => {
  try {
    const allChallenges = await DB.challenges.getAll();
    const completedToday = await DB.challenges.getCompletedToday(req.user.id);

    // Merge completed status
    const challenges = allChallenges.map(c => ({
      ...c,
      completed: completedToday.includes(c.id)
    }));

    res.json(challenges);
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/actions/challenges/:id/complete
// @desc    Complete a daily challenge and award eco-points
router.post('/challenges/:id/complete', authMiddleware, async (req, res, next) => {
  try {
    const challengeId = req.params.id;
    const allChallenges = await DB.challenges.getAll();
    const challenge = allChallenges.find(c => c.id === challengeId);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found.' });
    }

    const result = await DB.challenges.complete(req.user.id, challenge.id, challenge.points);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.json({
      message: `Completed "${challenge.title}"! Awarded ${challenge.points} eco-points! 🎉`,
      user: {
        id: result.user._id,
        ecoPoints: result.user.ecoPoints,
        treesPlanted: result.user.treesPlanted,
      }
    });

  } catch (err) {
    next(err);
  }
});

// @route   POST /api/actions/plant-tree
// @desc    Plant a tree by exchanging 100 eco-points
router.post('/plant-tree', authMiddleware, async (req, res, next) => {
  try {
    const user = await DB.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const pointsCost = 100;
    if (user.ecoPoints < pointsCost) {
      return res.status(400).json({ message: `Insufficient points. You need at least ${pointsCost} points to plant a virtual tree.` });
    }

    const updatedUser = await DB.users.plantTree(req.user.id, pointsCost);

    // Create a public announcement post in the community board
    await DB.posts.create(
      'Green Initiative',
      `🌱 Shoutout to @${user.username} for planting a virtual tree! Let's build a greener future together!`,
      1
    );

    res.json({
      message: 'Tree planted successfully! Thank you for making a difference! 🌳',
      user: {
        id: updatedUser._id,
        ecoPoints: updatedUser.ecoPoints,
        treesPlanted: updatedUser.treesPlanted,
      }
    });

  } catch (err) {
    next(err);
  }
});

export default router;
