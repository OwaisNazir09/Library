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
  year: Number,
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  genre: String,
  location: String,
  shelf: String,
  row: String,
  price: { type: Number, default: 0 },
  isForSale: { type: Boolean, default: false },
  description: String,
  coverImage: String,
  createdAt: { type: Date, default: Date.now }
});

export default bookSchema;
