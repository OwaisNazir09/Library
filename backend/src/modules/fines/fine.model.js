import mongoose from 'mongoose';

const fineSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Borrowing',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid'
  },
  paidAt:  { type: Date, default: null },
  paidVia: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

fineSchema.index({ tenantId: 1, student: 1 });
fineSchema.index({ tenantId: 1, status: 1 });

export default fineSchema;
