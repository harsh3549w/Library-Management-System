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

    phone: {
      type: String,
      required: [true, "Please provide your phone number"],
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    rollNumber: {
      type: String,
      trim: true,
      sparse: true, // Allow multiple null values but unique non-null values
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


    avatar: {
      public_id: String,
      url: String,
    },

    fineBalance: {
      type: Number,
      default: 0,
      min: 0
    },

    totalFinesPaid: {
      type: Number,
      default: 0,
      min: 0
    },

    verificationCode: Number,
    verificationCodeExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    
    // Track first-time login
    hasLoggedIn: {
      type: Boolean,
      default: false,
    },
    
    // Track if user needs to change password on first login
    needsPasswordChange: {
      type: Boolean,
      default: false,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field to check if user can borrow
userSchema.virtual('canBorrow').get(function() {
  return this.fineBalance === 0;
});

// Generate verification code method
userSchema.methods.generateVerificationCode = function() {
  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  this.verificationCode = verificationCode;
  this.verificationCodeExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
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
