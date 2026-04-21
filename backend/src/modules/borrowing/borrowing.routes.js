import express from 'express';
import { borrowBook, returnBook, getUserBorrowings, getMyBorrowings, getOverdueBooks, getAllBorrowings } from './borrowing.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { restrictToFeature } from '../../middleware/subscriptionCheck.js';

const router = express.Router();

router.use(protect);
router.use(restrictToFeature('circulation'));

router.post('/borrow', borrowBook);
router.patch('/return/:id', returnBook);
router.get('/my', getMyBorrowings);
router.get('/user/:userId', getUserBorrowings);
router.get('/overdue', restrictTo('librarian'), getOverdueBooks);
router.get('/', restrictTo('librarian'), getAllBorrowings);

export default router;
