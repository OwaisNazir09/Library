import express from 'express';
import { 
  getAllResources, 
  createResource, 
  getResource, 
  updateResource, 
  deleteResource,
  trackDownload
} from './resource.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { createResourceUploader } from '../../middleware/upload.middleware.js';

const router = express.Router();
const upload = createResourceUploader();

router.route('/')
  .get(protect, getAllResources)
  .post(
    protect, 
    restrictTo('admin', 'librarian'), 
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
    restrictTo('admin', 'librarian'), 
    upload.fields([
      { name: 'file', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 }
    ]), 
    updateResource
  )
  .delete(protect, restrictTo('admin', 'librarian'), deleteResource);

router.patch('/:id/download', protect, trackDownload);

export default router;
