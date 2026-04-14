import api from './api';

const BASE = '/finance';

// Dashboard
export const getFinanceStats = () => api.get(`${BASE}/stats`);

// Student Accounts
export const getStudentAccounts = (params) => api.get(`${BASE}/accounts`, { params });
export const getStudentAccount = (studentId, params) => api.get(`${BASE}/accounts/${studentId}`, { params });

// Student Account Actions
export const addPayment = (studentId, data) => api.post(`${BASE}/accounts/${studentId}/payment`, data);
export const addCharge = (studentId, data) => api.post(`${BASE}/accounts/${studentId}/charge`, data);
export const addCreditNote = (studentId, data) => api.post(`${BASE}/accounts/${studentId}/credit-note`, data);
export const addDebitNote = (studentId, data) => api.post(`${BASE}/accounts/${studentId}/debit-note`, data);

// Expenses
export const addExpense = (data) => api.post(`${BASE}/transactions/expense`, data);

// Transactions
export const getTransactions = (params) => api.get(`${BASE}/transactions`, { params });

// Receipts
export const getReceipts = (params) => api.get(`${BASE}/receipts`, { params });
export const getReceipt = (id) => api.get(`${BASE}/receipts/${id}`);

// Reports
export const getDailyReport = (params) => api.get(`${BASE}/reports/daily`, { params });
export const getMonthlyReport = (params) => api.get(`${BASE}/reports/monthly`, { params });
export const getPendingReport = () => api.get(`${BASE}/reports/pending`);
export const getPLReport = (params) => api.get(`${BASE}/reports/pl`, { params });
