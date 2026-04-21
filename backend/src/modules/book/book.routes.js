import express from 'express';
import { getAllBooks, createBook, getBook, updateBook, deleteBook } from './book.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { restrictToFeature } from '../../middleware/subscriptionCheck.js';
import { createUploader } from '../../middleware/upload.middleware.js';

const router = express.Router();
const upload = createUploader('books');

router.route('/')
  .get(restrictToFeature('bookManagement'), getAllBooks)
  .post(protect, restrictTo('librarian'), restrictToFeature('bookManagement'), upload.single('coverImage'), createBook);

router.route('/:id')
  .get(restrictToFeature('bookManagement'), getBook)
  .patch(protect, restrictTo('librarian'), restrictToFeature('bookManagement'), upload.single('coverImage'), updateBook)
  .delete(protect, restrictTo('librarian'), restrictToFeature('bookManagement'), deleteBook);

export default router;
