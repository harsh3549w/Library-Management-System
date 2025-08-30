import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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

// Generate verification code method
userSchema.methods.generateVerificationCode = function() {
  function generateRandomFiveDigitNumber() {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainingDigits = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return parseInt(firstDigit + remainingDigits);
  }
  
  const verificationCode = generateRandomFiveDigitNumber();
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = Date.now() + 15 * 60 * 1000;
  return verificationCode;
};

// Generate JWT token method
userSchema.methods.generateToken = function() {
    if (!process.env.JWT_SECRET_KEY || !process.env.JWT_EXPIRE) {
        throw new Error('JWT configuration missing');
    }
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Generate password reset token method
userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    return resetToken;
};

// Export User Model
export const User = mongoose.model("User", userSchema);
