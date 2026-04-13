import express from 'express';
import * as ledgerController from './ledger.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('librarian', 'admin', 'super_admin'));
router.get('/stats', ledgerController.getLedgerStats);

router.route('/')
  .get(ledgerController.getLedgers);

router.route('/:studentId')
  .get(ledgerController.getStudentLedger);

router.post('/:studentId/payment', ledgerController.addPayment);
router.post('/:studentId/charge', ledgerController.addCharge);

export default router;
