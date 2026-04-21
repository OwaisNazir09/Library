import express from 'express';
import * as queryController from './query.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.post('/', queryController.createQuery);

router.use(protect);
router.use(restrictTo('super_admin'));

router.get('/', queryController.getAllQueries);
router.patch('/:id', queryController.updateQueryStatus);
router.delete('/:id', queryController.deleteQuery);

export default router;
