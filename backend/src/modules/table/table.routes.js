import express from 'express';
import { getAllTables, createTable, reserveTable } from './table.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getAllTables)
  .post(protect, restrictTo('admin', 'librarian'), createTable);

router.patch('/:id/reserve', protect, reserveTable);

export default router;
