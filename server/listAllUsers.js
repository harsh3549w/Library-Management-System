import { config } from "dotenv";
config({ path: "./config/config.env" });

import mongoose from "mongoose";
import { User } from "./models/userModel.js";

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database\n");

    // Get all users
    const allUsers = await User.find({}).select('name email role fineBalance totalFinesPaid');
    
    console.log(`=== ALL USERS (${allUsers.length}) ===\n`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Fine Balance: ₹${user.fineBalance || 0}`);
      console.log(`   Total Paid: ₹${user.totalFinesPaid || 0}`);
      console.log('');
    });

    // Filter users with any fines
    const usersWithFines = allUsers.filter(u => (u.fineBalance || 0) > 0 || (u.totalFinesPaid || 0) > 0);
    
    console.log(`\n=== USERS WITH FINES HISTORY (${usersWithFines.length}) ===\n`);
    usersWithFines.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Outstanding: ₹${user.fineBalance || 0}`);
      console.log(`   Paid: ₹${user.totalFinesPaid || 0}`);
      console.log('');
    });

    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

listUsers();

