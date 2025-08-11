const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');



router.post('/login', async (req, res) => {
  try {
    const { Username, Password } = req.body;

    const existingUsername = await User.findOne({ Username });
    if (!existingUsername) {
      return res.status(400).json({ message: 'Invalid username' });
    }

    const isPasswordValid = await bcrypt.compare(Password, existingUsername.Password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: existingUsername._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Protected Profile Route

module.exports = router;
