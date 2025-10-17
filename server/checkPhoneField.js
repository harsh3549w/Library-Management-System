import mongoose from "mongoose";
import { config } from "dotenv";

config({ path: "./config/config.env" });

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Check phone field in user documents
const checkPhoneField = async () => {
  try {
    await connectDB();
    
    // Get the User collection
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).limit(5).toArray();
    
    console.log("Checking phone field in user documents:");
    console.log("=====================================");
    
    if (users.length === 0) {
      console.log("No users found in database");
      return;
    }
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`- Name: ${user.name}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Phone: ${user.phone || 'FIELD NOT FOUND'}`);
      console.log(`- Role: ${user.role}`);
      console.log(`- All fields:`, Object.keys(user));
    });
    
    // Check schema
    console.log("\n=====================================");
    console.log("Checking if phone field exists in schema...");
    
    const userSchema = mongoose.models.User?.schema || mongoose.model('User').schema;
    const phoneField = userSchema.paths.phone;
    
    if (phoneField) {
      console.log("✅ Phone field exists in schema");
      console.log("Phone field details:", {
        type: phoneField.instance,
        required: phoneField.isRequired,
        default: phoneField.defaultValue
      });
    } else {
      console.log("❌ Phone field NOT found in schema");
    }
    
  } catch (error) {
    console.error("Error checking phone field:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
};

checkPhoneField();
