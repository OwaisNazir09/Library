import express from 'express';
import * as financeController from './finance.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
// --- Student/Member Personal Access ---
router.get('/me/ledger', financeController.getMyLedger);

router.use(restrictTo('librarian', 'admin', 'super_admin'));

// --- Dashboard & Summary ---
router.get('/stats', financeController.getFinanceStats);

// --- Account Management ---
router.get('/accounts', financeController.getAccounts);
router.post('/accounts', financeController.addAccount);
router.get('/accounts/:id/ledger', financeController.getAccountLedger);

// --- Financial Entry Entry (Double Entry) ---
router.post('/transactions', financeController.addTransaction);
router.post('/transactions/journal', financeController.addJournalEntry);
router.post('/transactions/transfer', financeController.addTransfer);

// --- Student Specific Unified Entries ---
router.post('/accounts/:studentId/payment', financeController.addPayment);
router.post('/accounts/:studentId/charge', financeController.addCharge);

// --- Statement & History ---
router.get('/transactions', financeController.getTransactions);
router.get('/receipts', financeController.getReceipts);
router.get('/receipts/:id', financeController.getReceipt);

// --- Professional Reports ---
router.get('/reports/trial-balance', financeController.getTrialBalance);
router.get('/reports/profit-loss', financeController.getProfitAndLoss);
router.get('/reports/balance-sheet', financeController.getBalanceSheet);

export default router;
