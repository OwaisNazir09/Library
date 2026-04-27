import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import logger from './src/utils/logger.js';
import { initSubscriptionCron } from './src/services/subscriptionCron.js';

console.log("ENV TEST:", process.env.CLOUDINARY_API_KEY);
const port = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  logger.info('User connected via socket');

  socket.on('disconnect', () => {
    logger.info('User disconnected');
  });
});

app.set('io', io);

// Serverless connection caching for Vercel
let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;
  if (mongoose.connection.readyState >= 1) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  logger.info("Connecting to MongoDB...");
  cachedDb = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  logger.info("Master Database connected successfully");
  initSubscriptionCron();
  return cachedDb;
}

// Global middleware to guarantee DB connection before any route is hit
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    logger.error("DB Connection Error:", err);
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});

// Start server only if NOT running on Vercel
if (!process.env.VERCEL) {
  const server = httpServer.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });

  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down...');
    logger.error(err);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...');
    logger.error(err);
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => logger.info('Process terminated!'));
  });
}

export default app;