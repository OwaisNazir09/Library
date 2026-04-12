import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  tableNumber: { type: String, required: true },
  capacity: { type: Number, required: true },
  location: String,
  isAvailable: { type: Boolean, default: true },
  hasPowerOutlet: { type: Boolean, default: false },
  isReserved: { type: Boolean, default: false }
});

export default tableSchema;
