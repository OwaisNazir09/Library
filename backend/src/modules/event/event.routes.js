import express from 'express';
import { getAllEvents, createEvent, deleteEvent } from './event.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { restrictToFeature } from '../../middleware/subscriptionCheck.js';
import { createUploader } from '../../middleware/upload.middleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictToFeature('circulation'));
const upload = createUploader('events');

router.route('/')
  .get(getAllEvents)
  .post(protect, restrictTo('librarian'), upload.single('bannerImage'), createEvent);

router.route('/:id')
  .delete(protect, restrictTo('librarian'), deleteEvent);

export default router;
