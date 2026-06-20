import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { dbConnect } from './database.js';

// Import Security Middlewares
import { 
  securityHeaders, rateLimiter, sanitizeInput, 
  preventNoSqlInjection, preventParameterPollution 
} from './middleware/security.js';
import errorHandler from './middleware/errorHandler.js';

// Import Route Handlers
import authRoutes from './routes/auth.js';
import calculatorRoutes from './routes/calculator.js';
import actionsRoutes from './routes/actions.js';
import goalsRoutes from './routes/goals.js';
import communityRoutes from './routes/community.js';
import chatRoutes from './routes/chat.js';

const app = express();
const PORT = config.port;

// CORS configuration - only allow requests from trusted frontend client
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// Apply Security Headers & Rate Limiting
app.use(securityHeaders);
app.use(rateLimiter({ max: 300, windowMs: 15 * 60 * 1000 })); // Rate limiter for standard API routes
app.use(express.json({ limit: '10kb' })); // Mitigate body parsing size attacks
app.use(preventNoSqlInjection); // Strips NoSQL injection parameters
app.use(preventParameterPollution); // Prevents HTTP Parameter Pollution (HPP)
app.use(sanitizeInput); // Input sanitization middleware

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

// Centralized error handling middleware
app.use(errorHandler);

// Run server after connecting to database
const startServer = async () => {
  await dbConnect();
  app.listen(PORT, () => {
    console.log(`Carbon Footprint Server running on port ${PORT}`);
  });
};

startServer();
