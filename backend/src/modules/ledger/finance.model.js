import mongoose from 'mongoose';

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
      'Cash', 'Bank', 'UPI', 'Wallet',         // Liquid Assets
      'Student Receivable', 'Other Receivable', // Current Assets
      'Deposit', 'Payable',                    // Liabilities
      'Operating Income', 'Other Income',      // Income
      'Operating Expense', 'Direct Expense',   // Expenses
      'Capital', 'Retained Earnings'           // Equity
    ],
    required: true
  },

  parentAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },

  // For student-specific receivable accounts
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  openingBalance: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },

  description: { type: String },
  isSystem: { type: Boolean, default: false }, // Prevent manual deletion of student/system accounts
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

// Ensure account name is unique per tenant
accountSchema.index({ tenantId: 1, name: 1 }, { unique: true });

// ── Transaction (Double Entry) ───────────────────────────────────────────────
export const transactionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },

  // Double-entry pair
  debitAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  creditAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },

  amount: { type: Number, required: true, min: 0 },

  type: {
    type: String,
    enum: ['journal', 'receipt', 'payment', 'expense', 'income', 'transfer', 'fee_charge'],
    required: true
  },

  category: { type: String }, // Optional tag for grouping
  description: { type: String, required: true },
  reference: { type: String }, // Receipt #, Invoice #

  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Snapshots for ledger view
  debitAccountBalance: { type: Number },
  creditAccountBalance: { type: Number }
}, { timestamps: true });

// ── Receipt ──────────────────────────────────────────────────────────────────
export const receiptSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  receiptNumber: { type: String, required: true },

  type: {
    type: String,
    enum: ['payment', 'fee_charge', 'expense', 'income', 'transfer'],
    required: true
  },

  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  amount: { type: Number, required: true },

  description: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export const Account = mongoose.model('Account', accountSchema);
export const Transaction = mongoose.model('Transaction', transactionSchema);
export const Receipt = mongoose.model('Receipt', receiptSchema);
