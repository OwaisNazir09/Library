import mongoose from 'mongoose';

const platformPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'one_time'],
    default: 'monthly'
  },
  durationDays: {
    type: Number,
    required: [true, 'Duration in days is required'],
    min: 1
  },
  features: {
    digitalLibrary: { type: Boolean, default: false },
    financeModule: { type: Boolean, default: false },
    reports: { type: Boolean, default: false },
    multiBranch: { type: Boolean, default: false },
    mobileApp: { type: Boolean, default: true },
    attendance: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true }
  },
  limits: {
    maxStudents: { type: Number, default: 500 },
    maxBooks: { type: Number, default: 5000 },
    maxStaff: { type: Number, default: 5 },
    maxBranches: { type: Number, default: 1 },
    storageGb: { type: Number, default: 5 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isTrial: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const PlatformPackage = mongoose.model('PlatformPackage', platformPackageSchema);

export default PlatformPackage;
