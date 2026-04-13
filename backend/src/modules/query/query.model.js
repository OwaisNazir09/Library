import mongoose from 'mongoose';

const querySchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  preferredContactTime: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening'],
    default: 'Morning'
  },
  message: {
    type: String,
    required: [true, 'Message/Query is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Closed'],
    default: 'New'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Query = mongoose.model('Query', querySchema);

export default Query;
