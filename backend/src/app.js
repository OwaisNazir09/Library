import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';

import globalErrorHandler from './middleware/errorHandler.js';
import { tenantHandler } from './middleware/tenant.js';
import tenantRoutes from './modules/tenant/tenant.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import bookRoutes from './modules/book/book.routes.js';
import borrowingRoutes from './modules/borrowing/borrowing.routes.js';
import tableRoutes from './modules/table/table.routes.js';
import eventRoutes from './modules/event/event.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import packageRoutes from './modules/package/package.routes.js';
import fineRoutes from './modules/fines/fine.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}));
app.options('*', cors());

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(mongoSanitize());

app.use(xss());

app.use('/api', tenantHandler);

// 3) ROUTES
app.use('/api/tenants', tenantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/reports', reportsRoutes);

app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  err.status = 'fail';
  next(err);
});

app.use(globalErrorHandler);

export default app;
