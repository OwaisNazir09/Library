import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  },
  checkIn: {
    type: Date,
    default: Date.now
  },
  checkOut: {
    type: Date
  },
  method: {
    type: String,
    enum: ['qr', 'manual'],
    default: 'qr'
  },
  note: {
    type: String
  }
}, { timestamps: true });

attendanceSchema.index({ tenantId: 1, userId: 1 });
attendanceSchema.index({ tenantId: 1, checkIn: -1 });

export default attendanceSchema;
