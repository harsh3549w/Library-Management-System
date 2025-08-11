const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    Username: { type: String, required: true, unique: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    role: { type: String, default: 'user' },
    branch: { type: String },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("User", userSchema);