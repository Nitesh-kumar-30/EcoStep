import express from 'express';
import { DB } from '../database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/community/leaderboard
// @desc    Get top users sorted by eco-points
router.get('/leaderboard', async (req, res, next) => {
  try {
    const leaderboard = await DB.users.getLeaderboard();
    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/community/posts
// @desc    Get all community chat/feed posts
router.get('/posts', async (req, res, next) => {
  try {
    const posts = await DB.posts.getAll();
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/community/posts
// @desc    Create a new community post
router.post('/posts', authMiddleware, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Post content cannot be empty.' });
    }

    const user = await DB.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const newPost = await DB.posts.create(user.username, content, user.ecoPoints);

    res.status(201).json(newPost);
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/community/posts/:id/like
// @desc    Like or unlike a community post
router.post('/posts/:id/like', authMiddleware, async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await DB.posts.like(postId, req.user.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
});

export default router;
