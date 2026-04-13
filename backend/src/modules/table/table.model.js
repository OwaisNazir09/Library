import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  tableNumber: { type: String, required: true },
  tableName: String,
  section: {
    type: String,
    enum: ['Reading Hall', 'Private Room', 'Silent Zone', 'General'],
    default: 'General'
  },
  floor: String,
  capacity: { type: Number, default: 1 },

  keyNumber: String,
  lockerNumber: String,
  hasStorage: { type: Boolean, default: false },
  remarks: String,

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedDate: Date,
  validUntil: Date,

  fee: { type: Number, default: 0 },
  deposit: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['Available', 'Assigned', 'Maintenance', 'Reserved', 'Expired'],
    default: 'Available'
  }
}, { timestamps: true });

tableSchema.pre('save', function (next) {
  if (this.validUntil && this.validUntil < new Date() && this.status === 'Assigned') {
    this.status = 'Expired';
  }
  next();
});

export default tableSchema;
