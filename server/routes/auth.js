const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post('/login', async (req, res) => {
  try {
    const { Username, Password } = req.body;

    const user = await User.findOne({ Username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username' });
    }

    // For first-time login, check if password matches roll_no@lib
    const defaultPassword = `${Username}@lib`;
    const isDefaultPassword = Password === defaultPassword;
    const isPasswordValid = isDefaultPassword || await bcrypt.compare(Password, user.Password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // If it's first login or using default password
    if (user.isFirstLogin || isDefaultPassword) {
      return res.status(200).json({ 
        requiresOTP: true, 
        message: 'First time login detected',
        userId: user._id
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, isFirstLogin: false });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate and send OTP
router.post('/generate-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Save OTP and its expiry
    user.tempOTP = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.Email,
      subject: 'Your Library System OTP',
      text: `Your OTP for password change is: ${otp}. Valid for 10 minutes.`
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error("OTP Error:", err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP and change password
router.post('/change-password', async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.tempOTP || user.tempOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.Password = hashedPassword;
    user.isFirstLogin = false;
    user.tempOTP = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, message: 'Password changed successfully' });

  } catch (err) {
    console.error("Password Change Error:", err);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

module.exports = router;
