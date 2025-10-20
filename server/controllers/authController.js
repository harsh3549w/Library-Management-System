import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateForgotPasswordEmailTemplate, generateFirstTimeLoginEmailTemplate, generateVerificationOtpEmailTemplate } from "../utils/emailTemplates.js";

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
    
    // Check if this is the user's first login
    if (!user.hasLoggedIn) {
        console.log("First-time login detected for user:", email);
        
        // Only require password change for regular users, not admins
        if (user.role === "User") {
            // Generate OTP for first-time login password change
            const verificationCode = user.generateVerificationCode();
            user.needsPasswordChange = true;
            await user.save({ validateBeforeSave: false });
            
            // Send OTP email
            try {
                const message = generateVerificationOtpEmailTemplate(verificationCode);
                await sendEmail({
                    email: user.email,
                    subject: "IIITDM Kurnool Library - First Login OTP - Password Change Required",
                    message
                });
                console.log("First-time login OTP sent to:", email);
            } catch (emailError) {
                console.error("Failed to send first-time login OTP:", emailError);
                // Don't fail the login if email fails
            }
            
            // Mark user as having logged in but require password change
            user.hasLoggedIn = true;
            await user.save({ validateBeforeSave: false });
            
            // Return special response indicating password change is required
            return res.status(200).json({
                success: true,
                message: "First-time login detected. Please verify OTP and change your password.",
                requiresPasswordChange: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }
        
        // Mark admin user as having logged in (no password change required)
        user.hasLoggedIn = true;
        await user.save({ validateBeforeSave: false });
    }
    
    // Check if user still needs to change password
    if (user.needsPasswordChange && user.role === "User") {
        return res.status(200).json({
            success: true,
            message: "Password change required. Please verify OTP and change your password.",
            requiresPasswordChange: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
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

    // Only send OTP for regular users, not admins
    if (user.role === "Admin") {
        return next(new ErrorHandler("Password reset via email link is not available for admin accounts. Please contact system administrator.", 403));
    }

    // Generate OTP for password reset
    const verificationCode = user.generateVerificationCode();
    await user.save({ validateBeforeSave: false });

    const message = generateVerificationOtpEmailTemplate(verificationCode);

    try {
        await sendEmail({
            email: user.email,
            subject: "IIITDM KURNOOL Library Management System - Password Reset OTP",
            message
        });

        res.status(200).json({
            success: true,
            message: `OTP sent to ${user.email} successfully.`
        });
    } catch (error) {
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
        return next(new ErrorHandler("Email, OTP, password, and confirm password are required", 400));
    }

    const user = await User.findOne({
        email,
        accountVerified: true,
        verificationCode: Number(otp),
        verificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Invalid or expired OTP", 400));
    }

    // Only allow password reset for regular users, not admins
    if (user.role === "Admin") {
        return next(new ErrorHandler("Password reset via OTP is not available for admin accounts. Please contact system administrator.", 403));
    }

    if (password !== confirmPassword) {
        return next(new ErrorHandler("Password & confirm password do not match", 400));
    }

    if (password.length < 8 || password.length > 16) {
        return next(new ErrorHandler("Password must be between 8 and 16 characters", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, "Password reset successfully", res);
});

// Verify OTP and change password for first-time login
export const verifyOTPAndChangePassword = catchAsyncErrors(async (req, res, next) => {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
        return next(new ErrorHandler("Email, OTP, new password, and confirm password are required", 400));
    }

    const user = await User.findOne({
        email,
        accountVerified: true,
        verificationCode: Number(otp),
        verificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Invalid or expired OTP", 400));
    }

    // Only allow for regular users, not admins
    if (user.role === "Admin") {
        return next(new ErrorHandler("Password change via OTP is not available for admin accounts. Please contact system administrator.", 403));
    }

    if (newPassword !== confirmPassword) {
        return next(new ErrorHandler("New password & confirm password do not match", 400));
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
        return next(new ErrorHandler("Password must be between 8 and 16 characters", 400));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    user.needsPasswordChange = false; // Clear the password change requirement
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Password changed successfully. You can now login with your new password."
    });
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