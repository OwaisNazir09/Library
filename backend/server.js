import dotenv from 'dotenv';
dotenv.config(); // ✅ MUST BE FIRST

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

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Master Database connected successfully');
    initSubscriptionCron();
  })
  .catch((err) => {
    logger.error('Database connection error:', err);
    process.exit(1);
  });

// Start server
const server = httpServer.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...');
  logger.error(err);

  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(err);

  process.exit(1);
});

// Graceful shutdown (Ctrl + C / SIGTERM)
process.on('SIGTERM', () => {
  logger.info('SIGTERM RECEIVED. Shutting down gracefully');

  server.close(() => {
    logger.info('Process terminated!');
  });
});