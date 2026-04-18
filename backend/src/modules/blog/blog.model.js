import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Blog content is required']
  },
  tags: {
    type: [String],
    default: []
  },
  coverImage: {
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  visibility: {
    type: String,
    enum: ['library', 'global'],
    default: 'library'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

blogSchema.index({ tenantId: 1, status: 1 });
blogSchema.index({ visibility: 1, status: 1 });

export default blogSchema;
