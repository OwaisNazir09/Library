import express from 'express';
import { getMyNotifications, markAsRead } from './notification.controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.patch('/mark-as-read', markAsRead);

export default router;
