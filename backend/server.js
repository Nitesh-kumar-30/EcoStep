import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbConnect } from './database.js';

// Import Route Handlers
import authRoutes from './routes/auth.js';
import calculatorRoutes from './routes/calculator.js';
import actionsRoutes from './routes/actions.js';
import goalsRoutes from './routes/goals.js';
import communityRoutes from './routes/community.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Run server after connecting to database
const startServer = async () => {
  await dbConnect();
  app.listen(PORT, () => {
    console.log(`Carbon Footprint Server running on port ${PORT}`);
  });
};

startServer();
