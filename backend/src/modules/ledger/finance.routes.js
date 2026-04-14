import express from 'express';
import * as financeController from './finance.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('librarian', 'admin', 'super_admin'));

// Dashboard
router.get('/stats', financeController.getFinanceStats);

// Student Accounts
router.get('/accounts', financeController.getStudentAccounts);
router.get('/accounts/:studentId', financeController.getStudentAccount);
router.post('/accounts/:studentId/payment', financeController.addPayment);
router.post('/accounts/:studentId/charge', financeController.addCharge);
router.post('/accounts/:studentId/credit-note', financeController.addCreditNote);
router.post('/accounts/:studentId/debit-note', financeController.addDebitNote);

// Expenses (library operational)
router.post('/transactions/expense', financeController.addExpense);

// Transactions
router.get('/transactions', financeController.getTransactions);

// Receipts
router.get('/receipts', financeController.getReceipts);
router.get('/receipts/:id', financeController.getReceipt);

// Reports
router.get('/reports/daily', financeController.getDailyReport);
router.get('/reports/monthly', financeController.getMonthlyReport);
router.get('/reports/pending', financeController.getPendingReport);
router.get('/reports/pl', financeController.getPLReport);

export default router;
