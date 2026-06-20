import express from 'express';
import { DB } from '../database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Helper to determine badge based on goal category
const getCategoryBadge = (category) => {
  switch (category.toLowerCase()) {
    case 'transport': return 'Green Commuter';
    case 'energy': return 'Energy Saver';
    case 'food': return 'Food Defender';
    case 'waste': return 'Waste Warrior';
    default: return 'Earth Guardian';
  }
};

// @route   GET /api/goals
// @desc    Get all goals for the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const goals = await DB.goals.getByUserId(req.user.id);
    res.json(goals);
  } catch (err) {
    console.error('Fetch goals error:', err);
    res.status(500).json({ message: 'Server error fetching goals.' });
  }
});

// @route   POST /api/goals
// @desc    Create a new carbon reduction goal
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, category, targetValue, deadline } = req.body;

    if (!title || !category || !targetValue || !deadline) {
      return res.status(400).json({ message: 'Please enter all goal fields.' });
    }

    const newGoal = await DB.goals.create(req.user.id, {
      title,
      category,
      targetValue: parseFloat(targetValue),
      deadline: new Date(deadline),
      currentValue: 0,
      completed: false,
    });

    res.status(201).json(newGoal);
  } catch (err) {
    console.error('Create goal error:', err);
    res.status(500).json({ message: 'Server error creating goal.' });
  }
});

// @route   PUT /api/goals/:id
// @desc    Update progress of a goal and check for completion
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const goalId = req.params.id;
    const { currentValue } = req.body;

    if (currentValue === undefined) {
      return res.status(400).json({ message: 'Current value is required for progress updates.' });
    }

    // Retrieve original goal
    const goals = await DB.goals.getByUserId(req.user.id);
    const goal = goals.find(g => g._id.toString() === goalId);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found.' });
    }

    const nextValue = parseFloat(currentValue);
    const completed = nextValue >= goal.targetValue;
    let badge = goal.badge;
    let pointsAwarded = 0;
    let updatedUser = null;

    // Check if the goal was just completed
    if (completed && !goal.completed) {
      badge = getCategoryBadge(goal.category);
      pointsAwarded = 150; // Big bonus points for achieving goals!
      updatedUser = await DB.users.addPoints(req.user.id, pointsAwarded);

      // Create a community celebration post
      await DB.posts.create(
        'Platform Milestones',
        `🏆 Milestone! @${req.user.username} achieved their goal "${goal.title}" and earned the "${badge}" badge!`,
        1
      );
    }

    const updatedGoal = await DB.goals.update(req.user.id, goalId, {
      currentValue: nextValue,
      completed,
      badge
    });

    res.json({
      goal: updatedGoal,
      completedJustNow: completed && !goal.completed,
      pointsAwarded,
      user: updatedUser ? {
        id: updatedUser._id,
        ecoPoints: updatedUser.ecoPoints,
        treesPlanted: updatedUser.treesPlanted,
      } : null,
      message: completed && !goal.completed
        ? `Congratulations! You accomplished your goal, earned 150 points, and unlocked the "${badge}" badge! 🎓`
        : 'Goal progress updated successfully.'
    });

  } catch (err) {
    console.error('Update goal progress error:', err);
    res.status(500).json({ message: 'Server error updating goal.' });
  }
});

// @route   DELETE /api/goals/:id
// @desc    Delete a carbon reduction goal
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const goalId = req.params.id;
    const deleted = await DB.goals.delete(req.user.id, goalId);

    if (!deleted) {
      return res.status(404).json({ message: 'Goal not found or unauthorized.' });
    }

    res.json({ message: 'Goal deleted successfully.', goal: deleted });
  } catch (err) {
    console.error('Delete goal error:', err);
    res.status(500).json({ message: 'Server error deleting goal.' });
  }
});

export default router;
