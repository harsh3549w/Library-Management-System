const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const User = require('../models/User');

console.log('Email Configuration:', {
    user: process.env.EMAIL_USER,
    // Don't log the actual password
    hasPassword: !!process.env.EMAIL_PASS
});

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Email template
const getEmailContent = (username) => `
Dear Student,

Your Library Management System account has been created. Please find your login credentials below:

Roll Number: ${username}
Initial Password: ${username}@lib

Please note:
1. This is a temporary password
2. You will be prompted to change your password on your first login
3. Access the library system at: http://localhost:5173 (or your actual domain)

For security reasons, please change your password immediately after your first login.

If you face any issues, please contact the library administrator.

Best regards,
Library Management Team
`;

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

// Function to send emails
async function sendCredentialsToAllUsers() {
    try {
        // Get all users
        const users = await User.find({});
        console.log(`Found ${users.length} users to send emails to.`);

        // Send emails to each user
        for (const user of users) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.Email,
                    subject: 'Your Library Management System Login Credentials',
                    text: getEmailContent(user.Username)
                });
                console.log(`✅ Sent credentials to ${user.Email}`);
            } catch (error) {
                console.error(`❌ Failed to send email to ${user.Email}:`, error.message);
            }
            // Add a small delay between emails to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('Finished sending all emails');
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error in sending emails:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}

// Run the script
sendCredentialsToAllUsers();
