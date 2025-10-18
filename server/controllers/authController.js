import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";

export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new ErrorHandler("Email and OTP are required.", 400));
    }

    const user = await User.findOne({
        email,
        accountVerified: false,
        verificationCode: Number(otp),
        verificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Invalid or expired OTP.", 400));
    }

    // Clean up any other unverified accounts with the same email
    await User.deleteMany({ email, accountVerified: false, _id: { $ne: user._id } });

    user.accountVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    sendToken(user, 201, "Account verified successfully.", res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
    console.log("Login attempt:", req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
        console.log("Missing fields - email:", !!email, "password:", !!password);
        return next(new ErrorHandler("Please enter all fields", 400));
    }
    
    const user = await User.findOne({ email, accountVerified: true }).select("+password");
    
    if (!user) {
        console.log("User not found or not verified for email:", email);
        return next(new ErrorHandler("Invalid email or password", 400));
    }
    
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    
    if (!isPasswordMatched) {
        console.log("Password mismatch for user:", email);
        return next(new ErrorHandler("Invalid email or password", 400));
    }
    
    console.log("Login successful for user:", email);
    sendToken(user, 200, "Login successful", res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
    res
        .status(200)
        .cookie("token", "", {
            expires: new Date(Date.now()),
            httpOnly: true
        })
        .json({
            success: true,
            message: "Logged out successfully"
        });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    
    // Ensure virtual fields are included
    const userData = user.toJSON();
    
    res.status(200).json({
        success: true,
        user: userData
    });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    if (!req.body.email) {
        return next(new ErrorHandler("Email is required", 400));
    }
    const user = await User.findOne({
        email: req.body.email,
        accountVerified: true
    });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

    try {
        await sendEmail({
            email: user.email,
            subject: "IIITDM KURNOOL Library Management System Password Recovery",
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully.`
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const token = req.params.token;
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler("Reset password token is invalid or has expired", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password & confirm password do not match", 400));
    }

    if (req.body.password.length < 8 || req.body.password.length > 16) {
        return next(new ErrorHandler("Password must be between 8 and 16 characters", 400));
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 200, "Password reset successfully", res);
});

// Update user information
export const updateUserInfo = catchAsyncErrors(async (req, res, next) => {
    const { name, email, phone, currentPassword, newPassword } = req.body;
    
    // Get current user
    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Validate required fields
    if (!name || !email || !phone) {
        return next(new ErrorHandler("Name, email, and phone are required", 400));
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return next(new ErrorHandler("Email is already taken", 400));
        }
    }

    // Update basic information
    user.name = name.trim();
    user.email = email.toLowerCase().trim();
    user.phone = phone.trim();

    // Handle password update if provided
    if (newPassword && newPassword.trim() !== '') {
        if (!currentPassword || currentPassword.trim() === '') {
            return next(new ErrorHandler("Current password is required to change password", 400));
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return next(new ErrorHandler("Current password is incorrect", 400));
        }

        // Validate new password
        if (newPassword.length < 6) {
            return next(new ErrorHandler("New password must be at least 6 characters", 400));
        }

        // Hash and update password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
    }

    // Save updated user
    await user.save();

    // Send response with updated user data (excluding password)
    const updatedUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountVerified: user.accountVerified,
        fineBalance: user.fineBalance,
        totalFinesPaid: user.totalFinesPaid,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };

    res.status(200).json({
        success: true,
        message: "User information updated successfully",
        user: updatedUser
    });
});