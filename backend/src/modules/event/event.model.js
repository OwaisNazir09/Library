import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  title: { type: String, required: true },
  description: String,
  eventDate: { type: Date, required: true },
  location: String,
  maxAttendees: { type: Number, default: 0 },
  currentAttendees: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  bannerImage: String,
  bannerImagePublicId: String,
  createdAt: { type: Date, default: Date.now }
});

export default eventSchema;
