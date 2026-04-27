import express from 'express';
import { scanQR, getMyAttendance, getAllAttendance, markAttendance, getAttendanceStats } from './attendance.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/scan', scanQR);

router.get('/me', getMyAttendance);

router.get('/', restrictTo('librarian'), getAllAttendance);
router.get('/stats', restrictTo('librarian'), getAttendanceStats);
router.post('/manual', restrictTo('librarian'), markAttendance);

export default router;
