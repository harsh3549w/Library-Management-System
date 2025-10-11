import mongoose from "mongoose";

const bookSuggestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Book title is required"],
    trim: true
  },
  author: {
    type: String,
    required: [true, "Author name is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Description is required"]
  },
  isbn: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true
  },
  suggestedBy: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  votes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  voteCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  adminNotes: {
    type: String,
    default: ""
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  approvedAt: Date,
  rejectedAt: Date
}, { timestamps: true });

// Index for faster queries
bookSuggestionSchema.index({ status: 1, voteCount: -1 });
bookSuggestionSchema.index({ "suggestedBy.id": 1 });

export const BookSuggestion = mongoose.model("BookSuggestion", bookSuggestionSchema);

