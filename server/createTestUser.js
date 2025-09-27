import { config } from "dotenv";
config({ path: "./config/config.env" });

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./models/userModel.js";
import { connectDB } from "./database/db.js";

const createTestUser = async () => {
    try {
        await connectDB();
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: "admin@test.com" });
        if (existingUser) {
            console.log("Test user already exists!");
            return;
        }
        
        // Create test admin user
        const hashedPassword = await bcrypt.hash("password123", 10);
        
        const testUser = await User.create({
            name: "Test Admin",
            email: "admin@test.com",
            password: hashedPassword,
            role: "Admin",
            accountVerified: true
        });
        
        console.log("Test user created successfully!");
        console.log("Email: admin@test.com");
        console.log("Password: password123");
        console.log("Role: Admin");
        
        process.exit(0);
    } catch (error) {
        console.error("Error creating test user:", error);
        process.exit(1);
    }
};

createTestUser();