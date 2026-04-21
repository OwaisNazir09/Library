import express from 'express';
import {
  getAllResources,
  createResource,
  getResource,
  updateResource,
  deleteResource,
  trackDownload,
  getPublicResources,
  getLibraryResources
} from './resource.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { restrictToFeature } from '../../middleware/subscriptionCheck.js';
import { createResourceUploader } from '../../middleware/upload.middleware.js';

const router = express.Router();
const upload = createResourceUploader();

router.get('/public', getPublicResources);
router.get('/library/:libraryId', protect, restrictToFeature('digitalLibrary'), getLibraryResources);

router.use(protect);
router.use(restrictToFeature('digitalLibrary'));

router.route('/')
  .get(protect, getAllResources)
  .post(
    protect,
    restrictTo('librarian'),
    upload.fields([
      { name: 'file', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 }
    ]),
    createResource
  );

router.route('/:id')
  .get(protect, getResource)
  .patch(
    protect,
    restrictTo('librarian'),
    upload.fields([
      { name: 'file', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 }
    ]),
    updateResource
  )
  .delete(protect, restrictTo('librarian'), deleteResource);

router.patch('/:id/download', protect, trackDownload);

export default router;
