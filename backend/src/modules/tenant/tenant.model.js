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
  ownerName: {
    type: String,
    trim: true
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
  city: String,
  state: String,
  country: { type: String, default: 'India' },
  pincode: String,
  whatsapp: String,
  libraryType: {
    type: String,
    enum: ['Study Library', 'Book Library', 'Digital Library', 'Hybrid'],
    default: 'Book Library'
  },
  libraryCode: String,
  logo: String,
  description: String,
  openingTime: String,
  closingTime: String,
  databaseName: {
    type: String,
    unique: true,
    sparse: true
  },
  plan: {
    type: String,
    default: 'trial'
  },
  subscriptionPlanId: {
    type: mongoose.Schema.ObjectId,
    ref: 'SubscriptionPlan'
  },
  status: {
    type: String,
    enum: ['active', 'trial', 'expired', 'suspended', 'disabled'],
    default: 'trial'
  },
  trialStart: {
    type: Date,
    default: Date.now
  },
  trialEnd: Date,
  expiryDate: Date,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  isSuspended: {
    type: Boolean,
    default: false
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
