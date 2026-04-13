import express from 'express';
import { getAllBooks, createBook, getBook, updateBook, deleteBook } from './book.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { createUploader } from '../../middleware/upload.middleware.js';

const router = express.Router();
const upload = createUploader('books');

router.route('/')
  .get(getAllBooks)
  .post(protect, restrictTo('admin', 'librarian'), upload.single('coverImage'), createBook);

router.route('/:id')
  .get(getBook)
  .patch(protect, restrictTo('admin', 'librarian'), upload.single('coverImage'), updateBook)
  .delete(protect, restrictTo('admin', 'librarian'), deleteBook);

export default router;
