import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "MERN_STACK_LIBRARY_MANAGEMENT",
      // Production optimizations for high-load scenarios
      maxPoolSize: 50, // Maintain up to 50 socket connections for high traffic
      minPoolSize: 10, // Always keep at least 10 connections ready
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    });
    console.log("Database connected successfully ✅ (Pool: 10-50 connections)");
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (err) {
    console.error(`Database connection failed ❌: ${err}`);
    process.exit(1); // Exit process with failure
  }
};
