import express from 'express';
import * as tableController from './table.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('librarian', 'admin'));

router.route('/')
  .get(tableController.getAllTables)
  .post(tableController.createTable);

router.route('/:id')
  .patch(tableController.updateTable)
  .delete(tableController.deleteTable);

router.post('/:id/assign', tableController.assignTable);
router.post('/:id/unassign', tableController.unassignTable);

export default router;
