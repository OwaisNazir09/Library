import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";

import globalErrorHandler from "./middleware/errorHandler.js";
import { tenantHandler } from "./middleware/tenant.js";
import tenantRoutes from "./modules/tenant/tenant.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import bookRoutes from "./modules/book/book.routes.js";
import borrowingRoutes from "./modules/borrowing/borrowing.routes.js";
import tableRoutes from "./modules/table/table.routes.js";
import eventRoutes from "./modules/event/event.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import packageRoutes from "./modules/package/package.routes.js";
import fineRoutes from "./modules/fines/fine.routes.js";
import reportsRoutes from "./modules/reports/reports.routes.js";
import queryRoutes from "./modules/query/query.routes.js";
import resourceRoutes from "./modules/resource/resource.routes.js";
import financeRoutes from "./modules/ledger/finance.routes.js";
import blogRoutes from "./modules/blog/blog.routes.js";
import attendanceRoutes from "./modules/attendance/attendance.routes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:8081",
      "http://192.168.31.145:8081",
      "http://localhost:19000",
      "http://localhost:19001",
      "http://localhost:19002",
      "https://majestic-druid-c3c9b3.netlify.app",
      "https://libsystems.blinkbitlabs.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-tenant-id",
      "X-Requested-With",
      "Accept",
    ],
  }),
);

app.options("*", cors());
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

app.use("/api", tenantHandler);

app.use("/api/tenants", tenantRoutes);
app.use("/api/auth", authRoutes);
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

app.all("*", (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  err.status = "fail";
  next(err);
});

app.use(globalErrorHandler);

export default app;
