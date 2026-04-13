import express from 'express';
import { getAllEvents, createEvent, deleteEvent } from './event.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { createUploader } from '../../middleware/upload.middleware.js';

const router = express.Router();
const upload = createUploader('events');

router.route('/')
  .get(getAllEvents)
  .post(protect, restrictTo('admin', 'librarian'), upload.single('bannerImage'), createEvent);

router.route('/:id')
  .delete(protect, restrictTo('admin', 'librarian'), deleteEvent);

export default router;
