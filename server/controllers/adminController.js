import { User } from '../models/userModel.js';
import { AppError } from '../utils/errorHandler.js';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import { sendEmail } from '../utils/emailService.js';

// Batch register users - Admin only
export const batchRegisterUsers = catchAsyncErrors(async (req, res, next) => {
  const { users } = req.body;

  if (!users || !Array.isArray(users) || users.length === 0) {
    return next(new AppError('Please provide users array', 400));
  }

  if (users.length > 100) {
    return next(new AppError('Cannot register more than 100 users at once', 400));
  }

  const createdUsers = [];
  const errors = [];

  for (const userData of users) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        errors.push({
          email: userData.email,
          message: 'User already exists'
        });
        continue;
      }

      // Create new user
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '0000000000',
        address: userData.address || 'IIIT Kurnool',
        role: userData.role || 'User',
        rollNumber: userData.rollNumber,
        isFirstLogin: true // Mark as first time login
      });

      // Send welcome email with temporary password
      try {
        await sendEmail({
          email: user.email,
          subject: '🎓 Welcome to IIIT Kurnool Library - Account Created',
          message: `Dear Student,

Your library account has been successfully created!

📧 Email/Username: ${user.email}
🔑 Temporary Password: ${userData.password}
📚 Roll Number: ${userData.rollNumber}

🔒 IMPORTANT - First Login Instructions:
1. Visit the library portal and login with your credentials
2. You will be prompted to change your password
3. Complete your profile information
4. Update your contact details

📖 You can now:
• Browse and borrow books
• Reserve books
• Access digital archives
• Track your borrowed books and fines
• Make book suggestions

If you have any questions or need assistance, please contact the library administration.

Welcome to the IIIT Kurnool Library family!

Best regards,
IIIT Kurnool Library Team`
        });
        console.log(`Welcome email sent to ${user.email}`);
      } catch (emailError) {
        console.error(`Failed to send welcome email to ${user.email}:`, emailError.message);
        // Don't fail the registration if email fails, just log it
      }

      createdUsers.push({
        email: user.email,
        name: user.name,
        rollNumber: user.rollNumber
      });

    } catch (error) {
      errors.push({
        email: userData.email,
        message: error.message
      });
    }
  }

  res.status(201).json({
    success: true,
    message: `Successfully registered ${createdUsers.length} users`,
    createdUsers,
    errors: errors.length > 0 ? errors : undefined,
    count: {
      total: users.length,
      created: createdUsers.length,
      failed: errors.length
    }
  });
});

