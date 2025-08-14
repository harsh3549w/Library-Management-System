const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB...');
if (!mongoURI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

mongoose.connect(mongoURI.trim())
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Example users data - Replace with your actual user data
const users = [
    {
        Username: '1234cs0005', // Roll number
        Email: 'istudytooo@gmail.com',
        branch: 'Computer Science',
        role: 'student',
        isFirstLogin: true
    },
    // Add more users as needed
];

// Function to add users
async function addUsers() {
    try {
        for (const userData of users) {
            try {
                const existingUser = await User.findOne({ Username: userData.Username });
                if (existingUser) {
                    console.log(`User ${userData.Username} already exists, skipping...`);
                    continue;
                }

                // Generate initial password (roll_no@lib)
                const initialPassword = `${userData.Username}@lib`;
                
                // Hash the password
                const hashedPassword = await bcrypt.hash(initialPassword, 10);

                // Create new user with hashed password
                const user = new User({
                    ...userData,
                    Password: hashedPassword
                });

                await user.save();
                console.log(`✅ Added user ${userData.Username} with initial password: ${initialPassword}`);
            } catch (error) {
                console.error(`❌ Failed to add user ${userData.Username}:`, error.message);
            }
        }

        console.log('Finished adding users');
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error in adding users:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}

// Run the script
addUsers();
