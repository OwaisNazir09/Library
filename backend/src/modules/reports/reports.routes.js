import express from 'express';
import * as reportsController from './reports.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { restrictToFeature } from '../../middleware/subscriptionCheck.js';

const router = express.Router();

router.use(protect);
router.use(restrictToFeature('reports'));
router.use(restrictTo('librarian', 'super_admin'));

router.get('/summary', reportsController.getSummary);
router.get('/monthly', reportsController.getMonthlyAnalytics);
router.get('/expiring-memberships', reportsController.getExpiringMemberships);

export default router;
