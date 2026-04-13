import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, required: true, unique: true },
  publisher: String,
  category: { type: String, trim: true },
  language: String,
  edition: String,
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  bookCondition: { 
    type: String, 
    enum: ['New', 'Good', 'Old'],
    default: 'New'
  },
  purchaseDate: Date,
  price: { type: Number, default: 0 },
  shelfNumber: String,
  rackNumber: String,
  floor: String,
  librarySection: String,
  isForSale: { type: Boolean, default: false },
  description: String,
  coverImage: String,
  coverImagePublicId: String,
  createdAt: { type: Date, default: Date.now }
});

export default bookSchema;
