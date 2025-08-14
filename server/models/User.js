const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    Username: { type: String, required: true, unique: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    role: { type: String, default: 'user' },
    branch: { type: String },
    isFirstLogin: { type: Boolean, default: true },
    tempOTP: { type: String },
    otpExpiry: { type: Date },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("User", userSchema);