import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

import logger from './src/utils/logger.js';
import { initSubscriptionCron } from './src/services/subscriptionCron.js';
import globalErrorHandler from "./src/middleware/errorHandler.js";
import { tenantHandler } from "./src/middleware/tenant.js";
import { checkSubscription } from "./src/middleware/subscriptionCheck.js";

import authRoutes from "./src/modules/auth/auth.routes.js";
import userRoutes from "./src/modules/user/user.routes.js";
import bookRoutes from "./src/modules/book/book.routes.js";
import borrowingRoutes from "./src/modules/borrowing/borrowing.routes.js";
import tableRoutes from "./src/modules/table/table.routes.js";
import eventRoutes from "./src/modules/event/event.routes.js";
import notificationRoutes from "./src/modules/notification/notification.routes.js";
import dashboardRoutes from "./src/modules/dashboard/dashboard.routes.js";
import adminRoutes from "./src/modules/admin/admin.routes.js";
import packageRoutes from "./src/modules/package/package.routes.js";
import fineRoutes from "./src/modules/fines/fine.routes.js";
import reportsRoutes from "./src/modules/reports/reports.routes.js";
import queryRoutes from "./src/modules/query/query.routes.js";
import resourceRoutes from "./src/modules/resource/resource.routes.js";
import financeRoutes from "./src/modules/ledger/finance.routes.js";
import blogRoutes from "./src/modules/blog/blog.routes.js";
import attendanceRoutes from "./src/modules/attendance/attendance.routes.js";
import tenantRoutes from "./src/modules/tenant/tenant.routes.js";
import quoteRoutes from "./src/modules/quote/quote.routes.js";
import whatsappRoutes from "./src/modules/whatsapp/whatsapp.routes.js";

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welib API is running successfully on Vercel!',
    version: '1.0.0'
  });
});

const port = process.env.PORT || 5000;
const httpServer = createServer(app);





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

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-tenant-id",
      "x-platform",
      "X-Requested-With",
      "Accept",
    ],
  }),
);

app.options("*", cors());

app.use("/api", tenantHandler);
app.use("/api", checkSubscription);
app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(mongoSanitize());
app.use(xss());

app.use("/api/tenants", tenantRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrowings", borrowingRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/fines", fineRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/quotes", quoteRoutes);

app.all("*", (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  err.status = "fail";
  next(err);
});

app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'production') {
  httpServer.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
}

export default app;


