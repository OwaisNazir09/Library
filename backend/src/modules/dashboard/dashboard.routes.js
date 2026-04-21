import express from 'express';
import { getStats } from './dashboard.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, restrictTo('librarian'), getStats);

export default router;
