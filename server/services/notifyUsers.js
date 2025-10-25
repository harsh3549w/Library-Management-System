import cron from "node-cron";
import { User } from "../models/userModel.js";
import { Borrow } from "../models/borrowModel.js";
import { sendEmail } from "../utils/emailService.js";

// Removed daily notification feature as requested
// Users no longer receive daily emails

export const notifyOverdueBooks = () => {
  // Check every 5 minutes for testing (10-minute due dates)
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();
      
      const borrowers = await Borrow.find({
        dueDate: { $lt: now },
        returnDate: null,
        notified: { $ne: true }
      }).populate('book').populate('user');
      
      for (const borrow of borrowers) {
        try {
          if (borrow.user?.email) {
            const lateMinutes = Math.ceil((now - borrow.dueDate) / (1000 * 60));
            const finePerDay = 1; // ₹1 per day
            const lateDays = Math.ceil(lateMinutes / (24 * 60)); // Convert minutes to days
            const currentFine = lateDays * finePerDay;
            
            await sendEmail({
              email: borrow.user.email,
              subject: "⚠️ Book Overdue - Return Required",
              message: `Hello ${borrow.user.name},\n\nYour borrowed book is now OVERDUE!\n\nBook Details:\n• Title: "${borrow.book.title}"\n• Author: ${borrow.book.author}\n• ISBN: ${borrow.book.isbn || 'N/A'}\n\nDue Date: ${borrow.dueDate.toLocaleDateString()} ${borrow.dueDate.toLocaleTimeString()}\nOverdue by: ${lateMinutes} minutes (${lateDays} day(s))\n\nCurrent Fine: ₹${currentFine.toFixed(2)}\n\n⚠️ IMPORTANT: Please return this book immediately to avoid accumulating more fines.\n\nFine Rate: ₹1 per day\n\nBest regards,\nLibrary Team`
            });
            
            borrow.notified = true;
            await borrow.save();
            console.log(`Notified ${borrow.user.email} about overdue book "${borrow.book.title}"`);
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