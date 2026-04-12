import express from 'express';
import { getAllBooks, createBook, getBook, updateBook, deleteBook } from './book.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getAllBooks)
  .post(protect, restrictTo('admin', 'librarian'), createBook);

router.route('/:id')
  .get(getBook)
  .patch(protect, restrictTo('admin', 'librarian'), updateBook)
  .delete(protect, restrictTo('admin', 'librarian'), deleteBook);

export default router;
