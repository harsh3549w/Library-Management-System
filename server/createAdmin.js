import { config } from "dotenv";
config({ path: "./config/config.env" });

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./models/userModel.js";

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "MERN_STACK_LIBRARY_MANAGEMENT",
  });
  console.log("✅ DB connected");
}

const createAdmin = async () => {
  const name = process.argv.find(a => a.startsWith("--name="))?.split("=")[1] || "Library Admin";
  const email = process.argv.find(a => a.startsWith("--email="))?.split("=")[1] || "admin@library.com";
  const phone = process.argv.find(a => a.startsWith("--phone="))?.split("=")[1] || "0000000000";
  const passwordRaw = process.argv.find(a => a.startsWith("--password="))?.split("=")[1] || "password123";

  try {
    await connect();

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      console.log(`ℹ️ Admin already exists: ${email}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    const password = await bcrypt.hash(passwordRaw, 10);
    const admin = await User.create({
      name,
      email,
      phone,
      password,
      role: "Admin",
      accountVerified: true,
    });

    console.log("✅ Admin created:");
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log("   Password: (as provided)");
  } catch (err) {
    console.error("❌ Failed to create admin:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

createAdmin();


