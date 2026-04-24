import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a plan name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: [true, 'Please provide billing cycle']
  },
  trialDays: {
    type: Number,
    default: 7
  },
  features: {
    bookManagement: { type: Boolean, default: true },
    students: { type: Boolean, default: true },
    circulation: { type: Boolean, default: true },
    digitalLibrary: { type: Boolean, default: false },
    finance: { type: Boolean, default: false },
    reports: { type: Boolean, default: false },
    studyDesks: { type: Boolean, default: false },
    multiBranch: { type: Boolean, default: false },
    staffAccounts: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    blogs: { type: Boolean, default: false },
    dailyQuotes: { type: Boolean, default: false }
  },
  limits: {
    maxBooks: { type: Number, default: 500 },
    maxStudents: { type: Number, default: 300 },
    maxStaff: { type: Number, default: 5 },
    maxBranches: { type: Number, default: 1 },
    storageLimit: { type: Number, default: 1024 }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

export default SubscriptionPlan;
