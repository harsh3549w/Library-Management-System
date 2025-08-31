import cron from "node-cron";
import { User } from "../models/userModel.js";
import { Borrow } from "../models/borrowModel.js";
import { sendEmail } from "../utils/emailService.js";

export const notifyUsers = () => {
  // Daily notifications at 9am
  cron.schedule("0 9 * * *", async () => {
    try {
      const users = await User.find({});
      
      for (const user of users) {
        await sendEmail({
          email: user.email,
          subject: "Daily Notification",
          message: "This is your daily notification from the library system"
        });
      }
    } catch (error) {
      console.error("Notification error:", error);
    }
  });
};

export const notifyOverdueBooks = () => {
  cron.schedule("*/30 * * * *", async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const borrowers = await Borrow.find({
        dueDate: { $lt: oneDayAgo },
        returnDate: null,
        notified: false
      }).populate('user');
      
      for (const borrow of borrowers) {
        try {
          if (borrow.user?.email) {
            await sendEmail({
              email: borrow.user.email,
              subject: "Book Return Reminder",
              message: `Hello ${borrow.user.name},\n\nThis is a reminder that your borrowed book is overdue.`
            });
            
            borrow.notified = true;
            await borrow.save();
            console.log(`Notified ${borrow.user.email} about overdue book`);
          }
        } catch (error) {
          console.error(`Failed to notify ${borrow.user?.email || 'unknown user'}:`, error);
        }
      }
    } catch (error) {
      console.error("System error in notifyOverdueBooks:", error);
    }
  });
};