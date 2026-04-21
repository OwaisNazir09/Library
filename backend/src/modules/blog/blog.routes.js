import express from 'express';
import { getAllBlogs, getBlog, createBlog, approveBlog, deleteBlog } from './blog.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', getAllBlogs);
router.get('/:id', getBlog);

router.post('/', protect, createBlog);

router.patch('/:id/approve', protect, restrictTo('librarian'), approveBlog);
router.delete('/:id', protect, restrictTo('librarian'), deleteBlog);

export default router;
