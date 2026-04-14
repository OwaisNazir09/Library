import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Asset', 'Liability', 'Income', 'Expense'],
    required: true
  },
  code: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

accountSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export default accountSchema;
