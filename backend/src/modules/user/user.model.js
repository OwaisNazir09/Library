import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: false
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  role: {
    type: String,
    enum: ['member', 'librarian', 'super_admin'],
    default: 'member'
  },
  phone: String,
  dob: Date,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  addressLine1: String,
  addressLine2: String,
  city: String,
  district: String,
  state: String,
  pincode: String,
  idType: {
    type: String,
    enum: ['Aadhaar Card', 'Driving License', 'Student ID', 'Passport']
  },
  idNumber: String,
  idPhoto: String,
  idPhotoPublicId: String,
  profilePicture: String,
  profilePicturePublicId: String,
  membershipDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalBorrowed: {
    type: Number,
    default: 0
  },
  totalFines: {
    type: Number,
    default: 0
  },
  package: {
    type: mongoose.Schema.ObjectId,
    ref: 'Package'
  },
  packageStartDate: Date,
  packageEndDate: Date,
  subscriptionStatus: {
    type: String,
    enum: ['active', 'expired', 'inactive'],
    default: 'inactive'
  },
  fcmToken: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  rejectionReason: String,
  documents: [
    {
      name: String,
      fileUrl: String,
      publicId: String,
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      }
    }
  ],
  selectedServices: [
    {
      type: String,
      enum: ['Study Desk', 'Digital Library', 'Book Access', 'Locker', 'Internet']
    }
  ],
  userType: {
    type: String,
    enum: ['Student', 'Professional', 'Other'],
    default: 'Student'
  },
  // --------------------------------
  notes: String,
  membershipCharged: { type: Boolean, default: false }, // Prevents double-billing on approve
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('assignedTable', {
  ref: 'Table',
  foreignField: 'assignedTo',
  localField: '_id',
  justOne: true
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export default userSchema;
