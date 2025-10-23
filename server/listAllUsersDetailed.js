import { config } from "dotenv";
config({ path: "./config/config.env" });

import mongoose from "mongoose";
import { User } from "./models/userModel.js";

const listUsers = async () => {
  try {
    // Connect to MERN_STACK_LIBRARY_MANAGEMENT database specifically
    const dbUri = process.env.MONGO_URI.replace('/?', '/MERN_STACK_LIBRARY_MANAGEMENT?');
    await mongoose.connect(dbUri);
    console.log("Connected to MERN_STACK_LIBRARY_MANAGEMENT database");
    console.log("Database:", mongoose.connection.name);
    console.log("");

    // Get ALL users from MERN_STACK_LIBRARY_MANAGEMENT database (including unverified)
    const allUsers = await User.find({}).select('name email role fineBalance totalFinesPaid accountVerified createdAt').sort({ createdAt: -1 });
    
    console.log(`=== ALL USERS (${allUsers.length}) - INCLUDING UNVERIFIED ===\n`);
    
    if (allUsers.length === 0) {
      console.log("❌ NO USERS FOUND IN DATABASE!\n");
    } else {
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Verified: ${user.accountVerified ? '✅ YES' : '❌ NO'}`);
        console.log(`   Fine Balance: ₹${user.fineBalance || 0}`);
        console.log(`   Total Paid: ₹${user.totalFinesPaid || 0}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   User ID: ${user._id}`);
        console.log('');
      });
    }

    // Show only verified users
    const verifiedUsers = allUsers.filter(u => u.accountVerified);
    console.log(`\n=== VERIFIED USERS ONLY (${verifiedUsers.length}) ===\n`);
    verifiedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
    });

    // Show only unverified users
    const unverifiedUsers = allUsers.filter(u => !u.accountVerified);
    if (unverifiedUsers.length > 0) {
      console.log(`\n=== UNVERIFIED USERS (${unverifiedUsers.length}) ===\n`);
      unverifiedUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
      });
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

listUsers();


