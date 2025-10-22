import { config } from "dotenv";
config({ path: "./config/config.env" });

import mongoose from "mongoose";
import { User } from "./models/userModel.js";
import { Borrow } from "./models/borrowModel.js";

const checkFines = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database");

    // Get all users with fines
    const usersWithFines = await User.find({ fineBalance: { $gt: 0 } });
    
    console.log("\n=== USERS WITH OUTSTANDING FINES ===");
    for (const user of usersWithFines) {
      console.log(`\nUser: ${user.name} (${user.email})`);
      console.log(`Fine Balance: ₹${user.fineBalance}`);
      console.log(`Total Paid: ₹${user.totalFinesPaid || 0}`);

      // Get all borrows with fines for this user
      const borrows = await Borrow.find({
        "user.id": user._id,
        fine: { $gt: 0 }
      }).populate('book');

      console.log(`\nBorrow Records with Fines (${borrows.length}):`);
      borrows.forEach((borrow, index) => {
        console.log(`  ${index + 1}. Book: ${borrow.book?.title || 'Unknown'}`);
        console.log(`     Fine: ₹${borrow.fine}`);
        console.log(`     Paid: ${borrow.finePaid ? 'YES' : 'NO'}`);
        console.log(`     Due Date: ${borrow.dueDate}`);
        console.log(`     Returned: ${borrow.returnDate || 'Not returned'}`);
        console.log(`     Borrow ID: ${borrow._id}`);
      });

      // Calculate what the balance SHOULD be
      const unpaidFines = borrows
        .filter(b => !b.finePaid)
        .reduce((sum, b) => sum + b.fine, 0);
      
      console.log(`\n  Expected Balance: ₹${unpaidFines}`);
      console.log(`  Actual Balance: ₹${user.fineBalance}`);
      
      if (unpaidFines !== user.fineBalance) {
        console.log(`  ⚠️  MISMATCH! Difference: ₹${Math.abs(unpaidFines - user.fineBalance)}`);
      }
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkFines();

