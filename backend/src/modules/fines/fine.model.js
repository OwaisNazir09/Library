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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Fine = mongoose.model('Fine', fineSchema);

export default Fine;
