import express from 'express';
import { getAllBlogs, getBlog, createBlog, approveBlog, deleteBlog } from './blog.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

// Public: anyone can read approved blogs
router.get('/', getAllBlogs);
router.get('/:id', getBlog);

// Auth required: submit blog
router.post('/', protect, createBlog);

// Admin/librarian: approve or reject
router.patch('/:id/approve', protect, restrictTo('admin', 'librarian'), approveBlog);
router.delete('/:id', protect, restrictTo('admin', 'librarian'), deleteBlog);

export default router;
