import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import { uploadMedia } from "../utils/mediaUploader.js";
import bcrypt from "bcryptjs";

export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({ accountVerified: true });
  res.status(200).json({
    success: true,
    users,
  });
});

export const registerNewAdmin = catchAsyncErrors(async (req, res, next) => {
  if (!req.files?.avatar) {
    return next(new ErrorHandler("Admin avatar is required", 400));
  }
  
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please fill all fields", 400));
  }
  
  const isRegistered = await User.findOne({ email, accountVerified: true });
  if (isRegistered) {
    return next(new ErrorHandler("User already registered", 400));
  }
  
  if (password.length < 8 || password.length > 16) {
    return next(
      new ErrorHandler("Password must be between 8 to 16 characters long", 400)
    );
  }
  
  // Upload avatar to Cloudinary
  const avatar = await uploadMedia(req.files.avatar, "library-app/avatars");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "Admin",
    accountVerified: true,
    avatar: {
      public_id: avatar.public_id,
      url: avatar.url,
    },
  });

  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    user: user,
  });
});

export const registerNewUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password } = req.body;
  
  if (!name || !email || !phone || !password) {
    return next(new ErrorHandler("Please fill all fields", 400));
  }
  
  // Check if user already exists
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User with this email already exists", 400));
  }
  
  if (password.length < 6) {
    return next(new ErrorHandler("Password must be at least 6 characters long", 400));
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user with admin-created flag
  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: "User",
    accountVerified: true, // Auto-verify admin-created users
  });

  res.status(201).json({
    success: true,
    message: "User created successfully by admin",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      accountVerified: user.accountVerified,
      fineBalance: user.fineBalance,
      totalFinesPaid: user.totalFinesPaid,
      createdAt: user.createdAt,
    },
  });
});