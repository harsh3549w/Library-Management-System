import { config } from "dotenv";
config({ path: "./config/config.env" });

import mongoose from "mongoose";
import { User } from "./models/userModel.js";
import { Borrow } from "./models/borrowModel.js";
import { Book } from "./models/bookModel.js";

const fixFines = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database");

    const usersWithFines = await User.find({ fineBalance: { $gt: 0 } });
    
    console.log("\n=== FIXING USER FINE BALANCES ===");
    
    for (const user of usersWithFines) {
      console.log(`\nChecking: ${user.name} (${user.email})`);
      console.log(`Current Balance: ₹${user.fineBalance}`);

      // Get all borrows with fines for this user
      const allBorrows = await Borrow.find({
        "user.id": user._id,
        fine: { $gt: 0 }
      });

      // Calculate correct balance (only unpaid fines)
      const unpaidFines = allBorrows
        .filter(b => !b.finePaid)
        .reduce((sum, b) => sum + b.fine, 0);
      
      const paidFines = allBorrows
        .filter(b => b.finePaid)
        .reduce((sum, b) => sum + b.fine, 0);

      console.log(`Unpaid Fines: ₹${unpaidFines}`);
      console.log(`Paid Fines: ₹${paidFines}`);
      console.log(`Correct Balance Should Be: ₹${unpaidFines}`);

      if (user.fineBalance !== unpaidFines) {
        console.log(`⚠️  MISMATCH! Fixing...`);
        user.fineBalance = unpaidFines;
        user.totalFinesPaid = paidFines;
        await user.save();
        console.log(`✅ Fixed! New balance: ₹${user.fineBalance}`);
      } else {
        console.log(`✅ Balance is correct!`);
      }
    }

    console.log("\n=== FIX COMPLETE ===");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

fixFines();

