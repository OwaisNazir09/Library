import express from 'express';
import * as fc from './finance.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Student self-access
router.get('/me/ledger', fc.getMyLedger);

router.use(restrictTo('librarian', 'admin', 'super_admin'));

// Dashboard
router.get('/stats', fc.getFinanceStats);

router.get('/accounts', fc.getAccounts);
router.post('/accounts', fc.addAccount);
router.post('/accounts/seed', fc.seedAccounts);
router.get('/accounts/:id/ledger', fc.getAccountLedger);

router.post('/transactions', fc.addTransaction);
router.post('/transactions/journal', fc.addJournalEntry);
router.post('/transactions/transfer', fc.addTransfer);
router.get('/transactions', fc.getTransactions);

// Student-Specific Finance
router.post('/accounts/:studentId/payment', fc.addPayment);
router.post('/accounts/:studentId/charge', fc.addCharge);
router.post('/accounts/:studentId/refund', fc.issueRefund);

// Expenses
router.post('/expenses', fc.addExpense);

// Receipts
router.get('/receipts', fc.getReceipts);
router.get('/receipts/:id', fc.getReceipt);

// Reports
router.get('/reports/trial-balance', fc.getTrialBalance);
router.get('/reports/profit-loss', fc.getProfitAndLoss);
router.get('/reports/balance-sheet', fc.getBalanceSheet);

// Internal Accounts (backward compat)
router.get('/internal-accounts', fc.getInternalAccounts);
router.post('/internal-accounts', fc.addInternalAccount);

export default router;
