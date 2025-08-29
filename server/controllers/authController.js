import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Register User
export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if all fields are provided
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already exists", 400));
  }

  // Hash password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  user = await User.create({
    name,
    email,
    password: hashedPassword,
    verificationCode: Math.floor(100000 + Math.random() * 900000), // 6-digit OTP
    verificationCodeExpire: Date.now() + 15 * 60 * 1000, // 15 minutes expiry
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully. Please verify your email.",
    user,
  });
});
