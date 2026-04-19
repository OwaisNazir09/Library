import express from 'express';
import { sendNotification } from './notification.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'librarian', 'super_admin'));

router.post('/send', sendNotification);

export default router;
