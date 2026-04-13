import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Competitive Exams',
      'School Books',
      'College Books',
      'Notes',
      'Question Papers',
      'General Reading',
      'Custom Category'
    ]
  },
  subject: {
    type: String,
    trim: true
  },
  tags: {
    type: [String],
    default: []
  },
  fileUrl: {
    type: String,
    required: true
  },
  filePublicId: {
    type: String,
    required: true
  },
  coverImage: {
    type: String
  },
  coverImagePublicId: {
    type: String
  },
  fileSize: {
    type: Number // in bytes
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visibility: {
    type: String,
    enum: ['library', 'global'],
    default: 'library'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for visibility and tenant
resourceSchema.index({ tenantId: 1, visibility: 1 });
resourceSchema.index({ visibility: 1 });

export default resourceSchema;
