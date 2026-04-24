import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    quote: {
      type: String,
      required: [true, "A quote must have content"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "A quote must have an author"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Motivation",
        "Learning",
        "Books",
        "Wisdom",
        "Islamic",
        "Productivity",
        "Student Inspiration",
        "Other",
      ],
      default: "Motivation",
    },
    dateScheduled: {
      type: Date,
      default: Date.now,
    },
    active: {
      type: Boolean,
      default: true,
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
    libraryId: {
      type: mongoose.Schema.ObjectId,
      ref: "Tenant",
      required: function () {
        return !this.isGlobal;
      },
    },
    backgroundTheme: {
      type: String,
      default: "default",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default quoteSchema;
