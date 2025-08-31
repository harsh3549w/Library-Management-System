import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "MERN_STACK_LIBRARY_MANAGEMENT",
    });
    console.log("Database connected successfully ✅");
  } catch (err) {
    console.error(`Database connection failed ❌: ${err}`);
    process.exit(1); // Exit process with failure
  }
};
