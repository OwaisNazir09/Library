import express from 'express';
import { sendNotification, getMyNotifications, markNotificationsAsRead } from './notification.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.patch('/mark-as-read', markNotificationsAsRead);
router.post('/send', restrictTo('librarian', 'super_admin'), sendNotification);

export default router;
