import mongoose from "mongoose";

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Please provide your email"],
      lowercase: true,
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Please provide a password"],
      select: false, // Exclude password from query results by default
    },

    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },

    accountVerified: {
      type: Boolean,
      default: false,
    },

    borrowedBooks: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Borrow",
        },
        bookTitle: String,
        borrowedDate: Date,
        dueDate: Date,
        returned: {
          type: Boolean,
          default: false,
        },
      },
    ],

    avatar: {
      public_id: String,
      url: String,
    },

    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Export User Model
export const User = mongoose.model("User", userSchema);
