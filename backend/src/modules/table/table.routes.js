import express from 'express';
import * as tableController from './table.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { restrictToFeature } from '../../middleware/subscriptionCheck.js';

const router = express.Router();

router.use(protect);
router.use(restrictToFeature('studyDesks'));
router.use(restrictTo('librarian'));

router.route('/')
  .get(tableController.getAllTables)
  .post(tableController.createTable);

router.route('/:id')
  .patch(tableController.updateTable)
  .delete(tableController.deleteTable);

router.post('/:id/assign', tableController.assignTable);
router.post('/:id/unassign', tableController.unassignTable);

export default router;
