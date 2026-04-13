import express from 'express';
import { borrowBook, returnBook, getUserBorrowings, getOverdueBooks, getAllBorrowings } from './borrowing.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/borrow', borrowBook);
router.patch('/return/:id', returnBook);
router.get('/user/:userId', getUserBorrowings);
router.get('/overdue', restrictTo('admin', 'librarian'), getOverdueBooks);
router.get('/', restrictTo('admin', 'librarian'), getAllBorrowings);

export default router;
