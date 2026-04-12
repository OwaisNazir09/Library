import express from 'express';
import { getAllEvents, createEvent } from './event.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getAllEvents)
  .post(protect, restrictTo('admin', 'librarian'), createEvent);

export default router;
