import express from 'express';
import { DB } from '../database.js';
import authMiddleware from '../middleware/auth.js';
import { GoalService } from '../services/goalService.js';

const router = express.Router();

// @route   GET /api/goals
// @desc    Get all goals for the current user
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const goals = await DB.goals.getByUserId(req.user.id);
    res.json(goals);
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/goals
// @desc    Create a new carbon reduction goal
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { title, category, targetValue, deadline } = req.body;

    if (!title || !category || !targetValue || !deadline) {
      return res.status(400).json({ message: 'Please enter all goal fields.' });
    }

    const targetValFloat = parseFloat(targetValue);
    if (isNaN(targetValFloat) || targetValFloat <= 0 || targetValFloat > 100) {
      return res.status(400).json({ message: 'Target value must be a valid percentage between 1 and 100.' });
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate < new Date()) {
      return res.status(400).json({ message: 'Deadline must be a valid future date.' });
    }

    const newGoal = await DB.goals.create(req.user.id, {
      title: title.trim(),
      category: category.toLowerCase().trim(),
      targetValue: targetValFloat,
      deadline: deadlineDate,
      currentValue: 0,
      completed: false,
    });

    res.status(201).json(newGoal);
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/goals/:id
// @desc    Update progress of a goal and check for completion
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const goalId = req.params.id;
    const { currentValue } = req.body;

    if (currentValue === undefined) {
      return res.status(400).json({ message: 'Current value is required for progress updates.' });
    }

    const currentValueFloat = parseFloat(currentValue);
    if (isNaN(currentValueFloat) || currentValueFloat < 0) {
      return res.status(400).json({ message: 'Current value must be a valid positive number.' });
    }

    // Retrieve original goal
    const goals = await DB.goals.getByUserId(req.user.id);
    const goal = goals.find(g => g._id.toString() === goalId);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found.' });
    }

    // Delegate evaluation to service layer
    const evaluation = GoalService.evaluate(currentValueFloat, goal.targetValue, goal.category);
    
    let badge = goal.badge;
    let pointsAwarded = 0;
    let updatedUser = null;

    // Check if the goal was just completed
    if (evaluation.completed && !goal.completed) {
      badge = evaluation.badge;
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
      currentValue: currentValueFloat,
      completed: evaluation.completed,
      badge
    });

    res.json({
      goal: updatedGoal,
      completedJustNow: evaluation.completed && !goal.completed,
      pointsAwarded,
      user: updatedUser ? {
        id: updatedUser._id,
        ecoPoints: updatedUser.ecoPoints,
        treesPlanted: updatedUser.treesPlanted,
      } : null,
      message: evaluation.completed && !goal.completed
        ? `Congratulations! You accomplished your goal, earned 150 points, and unlocked the "${badge}" badge! 🏆`
        : 'Goal progress updated successfully.'
    });

  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/goals/:id
// @desc    Delete a carbon reduction goal
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const goalId = req.params.id;
    const deleted = await DB.goals.delete(req.user.id, goalId);

    if (!deleted) {
      return res.status(404).json({ message: 'Goal not found or unauthorized.' });
    }

    res.json({ message: 'Goal deleted successfully.', goal: deleted });
  } catch (err) {
    next(err);
  }
});

export default router;
