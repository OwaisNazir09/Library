import express from 'express';
import * as fineController from './fine.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('librarian', 'admin'));

router.route('/')
  .get(fineController.getFines)
  .post(fineController.createFine);

router.put('/:id/pay', fineController.payFine);

export default router;
