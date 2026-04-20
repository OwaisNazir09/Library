import mongoose from 'mongoose';

// ── Account (Chart of Accounts) ───────────────────────────────────────────────
export const accountSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },

  type: {
    type: String,
    enum: ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'],
    required: true
  },

  subType: {
    type: String,
    enum: [
      'Cash', 'Bank', 'UPI', 'Wallet',
      'Student Receivable', 'Other Receivable',
      'Deposit', 'Payable', 'Advance',
      'Operating Income', 'Other Income',
      'Fine Income', 'Service Income',
      'Operating Expense', 'Direct Expense',
      'Capital', 'Retained Earnings'
    ],
    required: true
  },

  parentAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },

  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  openingBalance: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },

  description: { type: String },
  isSystem: { type: Boolean, default: false }, // Prevent manual deletion
  isSeeded: { type: Boolean, default: false }, // Default COA accounts
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

// Ensure account name is unique per tenant
accountSchema.index({ tenantId: 1, name: 1 }, { unique: true });
accountSchema.index({ tenantId: 1, studentId: 1, subType: 1 });

// ── Transaction (Double Entry Journal) ───────────────────────────────────────
export const transactionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },

  // Double-entry pair
  debitAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  creditAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },

  amount: { type: Number, required: true, min: 0.01 },

  type: {
    type: String,
    enum: [
      'journal',    // Manual journal entry
      'receipt',    // Payment received from student
      'payment',    // Payment made (expense)
      'expense',    // Operational expense
      'income',     // Direct income
      'transfer',   // Account-to-account transfer
      'fee_charge', // Fee/charge applied to student
      'fine',       // Library fine charged
      'fine_payment', // Fine settled
      'refund',     // Refund issued
      'reversal',   // Reversal of a previous entry
      'advance'     // Advance payment
    ],
    required: true
  },

  category: { type: String },
  description: { type: String, required: true },

  // Unique traceable reference (e.g. RCP-2026-00001, FIN-00001)
  reference: { type: String },
  transactionRef: { type: String, unique: true, sparse: true },

  // For reversal chain — points to the original transaction being reversed
  reversalOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null },
  isReversed: { type: Boolean, default: false },

  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Balance snapshots at time of transaction
  debitAccountBalance: { type: Number },
  creditAccountBalance: { type: Number },

  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  ledgerLocked: { type: Boolean, default: true }
}, { timestamps: true });

transactionSchema.index({ tenantId: 1, date: -1 });
transactionSchema.index({ tenantId: 1, studentId: 1, date: -1 });
transactionSchema.index({ tenantId: 1, debitAccountId: 1 });
transactionSchema.index({ tenantId: 1, creditAccountId: 1 });

// ── Receipt ───────────────────────────────────────────────────────────────────
export const receiptSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  receiptNumber: { type: String, required: true },

  type: {
    type: String,
    enum: ['payment', 'fee_charge', 'expense', 'income', 'transfer', 'fine', 'refund'],
    required: true
  },

  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  amount: { type: Number, required: true },
  description: { type: String },
  notes: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

receiptSchema.index({ tenantId: 1, receiptNumber: 1 }, { unique: true });

export const Account = mongoose.model('Account', accountSchema);
export const Transaction = mongoose.model('Transaction', transactionSchema);
export const Receipt = mongoose.model('Receipt', receiptSchema);
