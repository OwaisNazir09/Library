import express from 'express';
import {
  getAllBlogs,
  getBlog,
  createBlog,
  approveBlog,
  deleteBlog,
  getPendingBlogs,
  addComment,
  getComments,
  toggleLike
} from './blog.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { createUploader } from '../../middleware/upload.middleware.js';

const router = express.Router();
const upload = createUploader('blogs');

router.get('/', getAllBlogs);
router.get('/pending', protect, restrictTo('librarian'), getPendingBlogs);
router.get('/:id', getBlog);

router.post('/', protect, upload.single('coverImage'), createBlog);

router.patch('/:id/approve', protect, restrictTo('librarian'), approveBlog);
router.delete('/:id', protect, restrictTo('librarian'), deleteBlog);

router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', getComments);
router.post('/:id/like', protect, toggleLike);

export default router;
