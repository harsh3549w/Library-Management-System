import { config } from "dotenv";
config({ path: "./config/config.env" });

import mongoose from "mongoose";
import { User } from "./models/userModel.js";
import { Borrow } from "./models/borrowModel.js";
import { Book } from "./models/bookModel.js";

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database");

    // Check specific user
    const email = "dhruvsing2003@gmail.com";
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`\n❌ User not found: ${email}`);
      mongoose.connection.close();
      return;
    }

    console.log(`\n=== USER: ${user.name} (${user.email}) ===`);
    console.log(`Role: ${user.role}`);
    console.log(`Fine Balance: ₹${user.fineBalance || 0}`);
    console.log(`Total Fines Paid: ₹${user.totalFinesPaid || 0}`);
    console.log(`Account Verified: ${user.accountVerified}`);
    console.log(`User ID: ${user._id}`);

    // Get ALL borrows for this user (with or without fines)
    const allBorrows = await Borrow.find({
      "user.id": user._id
    }).populate('book');

    console.log(`\n=== ALL BORROW RECORDS (${allBorrows.length}) ===`);
    
    if (allBorrows.length === 0) {
      console.log("No borrow records found for this user.");
    } else {
      allBorrows.forEach((borrow, index) => {
        console.log(`\n${index + 1}. Book: ${borrow.book?.title || 'Unknown'}`);
        console.log(`   Author: ${borrow.book?.author || 'Unknown'}`);
        console.log(`   Borrowed: ${borrow.borrowDate}`);
        console.log(`   Due Date: ${borrow.dueDate}`);
        console.log(`   Returned: ${borrow.returnDate || 'Not returned'}`);
        console.log(`   Fine: ₹${borrow.fine || 0}`);
        console.log(`   Fine Paid: ${borrow.finePaid ? 'YES' : 'NO'}`);
        console.log(`   Borrow ID: ${borrow._id}`);
      });

      // Calculate totals
      const totalFines = allBorrows.reduce((sum, b) => sum + (b.fine || 0), 0);
      const paidFines = allBorrows.filter(b => b.finePaid).reduce((sum, b) => sum + (b.fine || 0), 0);
      const unpaidFines = allBorrows.filter(b => !b.finePaid).reduce((sum, b) => sum + (b.fine || 0), 0);

      console.log(`\n=== SUMMARY ===`);
      console.log(`Total Fines from Records: ₹${totalFines}`);
      console.log(`Paid Fines from Records: ₹${paidFines}`);
      console.log(`Unpaid Fines from Records: ₹${unpaidFines}`);
      console.log(`User.fineBalance in DB: ₹${user.fineBalance || 0}`);
      
      if (unpaidFines !== user.fineBalance) {
        console.log(`\n⚠️  MISMATCH DETECTED!`);
        console.log(`Expected Balance: ₹${unpaidFines}`);
        console.log(`Actual Balance: ₹${user.fineBalance}`);
        console.log(`Difference: ₹${Math.abs(unpaidFines - user.fineBalance)}`);
      } else {
        console.log(`\n✅ Balance matches records!`);
      }
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkUser();

