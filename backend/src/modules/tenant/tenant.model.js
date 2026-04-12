import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tenant name is required'],
    unique: true,
    trim: true
  },
  subdomain: {
    type: String,
    required: [true, 'Subdomain is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: String,
  address: String,
  databaseName: {
    type: String,
    unique: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    maxBooksPerMember: {
      type: Number,
      default: 5
    },
    borrowingDays: {
      type: Number,
      default: 14
    },
    lateFeePerDay: {
      type: Number,
      default: 10
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
