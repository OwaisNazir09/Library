import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import logger from './src/utils/logger.js';

dotenv.config();

const port = process.env.PORT || 5000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  logger.info('A user connected');

  socket.on('disconnect', () => {
    logger.info('User disconnected');
  });
});

app.set('io', io);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('Master Database connected successfully'))
  .catch((err) => logger.error('Database connection error:', err));

httpServer.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  httpServer.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  httpServer.close(() => {
    logger.info('💥 Process terminated!');
  });
});
