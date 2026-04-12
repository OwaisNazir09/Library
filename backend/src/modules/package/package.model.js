import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a package name'],
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Please provide duration in days'],
    min: 1
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: 0
  },
  maxBooks: {
    type: Number,
    required: [true, 'Please provide max books allowed'],
    min: 1
  },
  description: {
    type: String,
    trim: true
  },
  tenantId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tenant',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Package = mongoose.model('Package', packageSchema);

export default Package;
