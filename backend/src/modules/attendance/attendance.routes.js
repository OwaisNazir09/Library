import express from 'express';
import { scanQR, getMyAttendance, getAllAttendance, markAttendance } from './attendance.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

// User scans QR
router.post('/scan', scanQR);

// User gets their own attendance
router.get('/me', getMyAttendance);

// Admin/librarian gets all attendance or marks manually
router.get('/', restrictTo('admin', 'librarian'), getAllAttendance);
router.post('/manual', restrictTo('admin', 'librarian'), markAttendance);

export default router;
