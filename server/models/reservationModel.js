import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
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
  reservationDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true,
    default: function() {
      // 30 minutes from now for testing
      return new Date(Date.now() + 30 * 60 * 1000);
    }
  },
  status: {
    type: String,
    enum: ["active", "fulfilled", "expired", "cancelled"],
    default: "active"
  },
  notified: {
    type: Boolean,
    default: false
  },
  fulfilledAt: Date,
  cancelledAt: Date
}, { timestamps: true });

// Index for faster queries
reservationSchema.index({ "user.id": 1, book: 1, status: 1 });
reservationSchema.index({ book: 1, status: 1 });
reservationSchema.index({ expiryDate: 1, status: 1 });

export const Reservation = mongoose.model("Reservation", reservationSchema);

