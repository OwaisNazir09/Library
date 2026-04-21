import express from 'express';
import * as packageController from './package.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('librarian'));

router
  .route('/')
  .get(packageController.getAllPackages)
  .post(packageController.createPackage);

router
  .route('/:id')
  .put(packageController.updatePackage)
  .delete(packageController.deletePackage);

export default router;
