import mongoose from 'mongoose';

const platformLedgerSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ['debit', 'credit'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'subscription_revenue', 'setup_fee', 'addon_revenue', 'upgrade_revenue',
      'bank_balance', 'payment_gateway', 'pending_receivable', 'wallet_balance',
      'refund_pending', 'gateway_charges', 'taxes_payable',
      'server_cost', 'sms_cost', 'email_cost', 'staff_cost', 'manual_expense'
    ],
    required: true
  },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  referenceType: {
    type: String,
    enum: ['tenant_creation', 'subscription_purchase', 'plan_upgrade', 'renewal', 'refund', 'manual', 'expense']
  },
  referenceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'referenceType' },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  tenantName: String,
  invoiceNumber: String,
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'cash', 'razorpay', 'stripe', 'manual'],
    default: 'manual'
  },
  notes: String,
  createdBy: String
}, { timestamps: true });

platformLedgerSchema.index({ date: -1 });
platformLedgerSchema.index({ tenantId: 1 });
platformLedgerSchema.index({ category: 1 });

const PlatformLedger = mongoose.model('PlatformLedger', platformLedgerSchema);
export default PlatformLedger;
