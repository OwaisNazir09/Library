import express from 'express';
import * as reportsController from './reports.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('librarian', 'admin', 'super_admin'));

router.get('/summary', reportsController.getSummary);
router.get('/monthly', reportsController.getMonthlyAnalytics);

export default router;
