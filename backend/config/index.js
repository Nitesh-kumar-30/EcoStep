import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = ['JWT_SECRET'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  console.warn(`⚠️ Warning: Missing required environment variables: ${missingEnv.join(', ')}. Using default values.`);
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'super_secret_eco_key_123',
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/carbon-footprint',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development'
};
