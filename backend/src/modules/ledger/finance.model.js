import mongoose from 'mongoose';

// ── Accounting Categories ────────────────────────────────────────────────────
// Income: membership_fee | study_desk_fee | late_fine | registration_fee | renewal_fee | other_income
// Expense: rent | electricity | internet | staff_salary | stationery | maintenance | other_expense
// Liability: refundable_deposit | advance_payment | credit_balance

// ── Student Account (one per student) ───────────────────────────────────────
const studentAccountSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, required: true }, // auto-generated e.g. ACC-00001

  openingBalance:  { type: Number, default: 0 },
  totalCharged:    { type: Number, default: 0 },  // total debit (fees + fines)
  totalPaid:       { type: Number, default: 0 },  // total credit (payments received)
  totalFines:      { type: Number, default: 0 },  // subset of totalCharged
  creditNoteTotal: { type: Number, default: 0 },
  debitNoteTotal:  { type: Number, default: 0 },

  // currentBalance = openingBalance + totalCharged + debitNoteTotal - totalPaid - creditNoteTotal
  currentBalance: { type: Number, default: 0 },
  status: { type: String, enum: ['clear', 'due', 'overdue'], default: 'clear' },

  lastPaymentDate: { type: Date },
  lastPaymentAmount: { type: Number, default: 0 },

  notes: { type: String }
}, { timestamps: true });

// ── Transaction ──────────────────────────────────────────────────────────────
const transactionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  
  // income | expense | fine | credit_note | debit_note | refund | adjustment
  type: {
    type: String,
    enum: ['income', 'expense', 'fine', 'credit_note', 'debit_note', 'refund', 'adjustment'],
    required: true
  },

  // Income categories
  // membership_fee | study_desk_fee | late_fine | registration_fee | renewal_fee | other_income
  // Expense categories
  // rent | electricity | internet | staff_salary | stationery | maintenance | other_expense
  category: { type: String, required: true },

  amount: { type: Number, required: true, min: 0 },

  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'card', 'wallet', 'other'],
    default: 'cash'
  },

  // For income/fine/credit_note/debit_note linked to a student
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  studentAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentAccount', default: null },

  description: { type: String, required: true },
  notes: { type: String },

  receiptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Receipt', default: null },

  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Running balance snapshot for the student account at the time of this transaction
  runningBalance: { type: Number, default: 0 }
}, { timestamps: true });

// ── Receipt ──────────────────────────────────────────────────────────────────
const receiptSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  receiptNumber: { type: String, required: true }, // e.g. RCP-2026-00001

  // payment | fee | fine | membership | credit_note | debit_note
  type: {
    type: String,
    enum: ['payment', 'fee', 'fine', 'membership', 'credit_note', 'debit_note'],
    required: true
  },

  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },

  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'card', 'wallet', 'other'],
    default: 'cash'
  },

  description: { type: String },
  notes: { type: String },

  date: { type: Date, default: Date.now }
}, { timestamps: true });

export { studentAccountSchema, transactionSchema, receiptSchema };
