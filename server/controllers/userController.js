import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import { uploadMedia } from "../utils/mediaUploader.js";

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