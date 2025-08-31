import mongoose from "mongoose";

const borrowSchema = new mongoose.Schema({
  user: {
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
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true
  },
  borrowDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: Date,
  fine: {
    type: Number,
    default: 0
  },
  notified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export const Borrow = mongoose.model("Borrow", borrowSchema);
