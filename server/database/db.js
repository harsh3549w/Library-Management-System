import mongoose from "mongoose";
import dns from "dns";

export const connectDB = async () => {
  const connectOnce = async (uri) => {
    await mongoose.connect(uri, {
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
  };

  const primaryUri = process.env.MONGO_URI;
  const fallbackDirectUri = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI_STANDARD;

  try {
    await connectOnce(primaryUri);
  } catch (err) {
    const msg = String(err?.message || err);
    const isSrvDnsIssue = /querySrv|ENOTFOUND|ECONNREFUSED/i.test(msg);
    console.error(`Database connection failed ❌: ${msg}`);
    if (isSrvDnsIssue) {
      console.warn("Retrying MongoDB connection using public DNS resolvers (8.8.8.8, 1.1.1.1)…");
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1", "9.9.9.9"]);
        await connectOnce(primaryUri);
        return;
      } catch (retryErr) {
        console.error(`Retry after setting public DNS failed ❌: ${retryErr}`);
      }
      // If SRV lookups are blocked, try a standard (non-SRV) connection string if provided
      if (fallbackDirectUri) {
        console.warn("Attempting fallback connection using MONGO_URI_DIRECT/MONGO_URI_STANDARD…");
        try {
          await connectOnce(fallbackDirectUri);
          return;
        } catch (directErr) {
          console.error(`Fallback direct connection failed ❌: ${directErr}`);
        }
      } else {
        console.warn("No MONGO_URI_DIRECT/MONGO_URI_STANDARD provided for non-SRV fallback.");
      }
    }
    process.exit(1); // Exit process with failure
  }
};
