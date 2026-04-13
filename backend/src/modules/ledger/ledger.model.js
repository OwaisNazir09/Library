import mongoose from 'mongoose';

// ── Ledger Account (one per student) ────────────────────────────────────────
const ledgerSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: false
  },
  ledgerId: {
    type: String,
    required: true
  },
  totalFee: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['clear', 'due', 'overdue'],
    default: 'clear'
  },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ── Ledger Entry (every individual transaction) ──────────────────────────────
const ledgerEntrySchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  ledger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['debit', 'credit'],
    required: true
  },
  amount: { type: Number, required: true, min: 0 },
  runningBalance: { type: Number, default: 0 },
  paymentMode: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'other'],
    default: 'cash'
  },
  category: {
    type: String,
    enum: ['admission_fee', 'monthly_fee', 'security_deposit', 'table_fee', 'locker_fee', 'late_fine', 'payment', 'refund', 'other'],
    default: 'other'
  },
  remarks: String,
  createdAt: { type: Date, default: Date.now }
});

export { ledgerSchema, ledgerEntrySchema };
