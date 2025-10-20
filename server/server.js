import { config } from "dotenv";
config({ path: "./config/config.env" });

import { v2 as cloudinary } from "cloudinary";
import { app } from "./app.js";
import { connectDB } from "./database/db.js";

// Validate Cloudinary environment variables
const cloudinaryVars = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
for (const varName of cloudinaryVars) {
  if (!process.env[varName]) {
    console.error(`Missing required Cloudinary environment variable: ${varName}`);
    process.exit(1);
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });

    process.on("unhandledRejection", (err) => {
      console.error("Unhandled Rejection:", err);
      server.close(() => process.exit(1));
    });

  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
};

startServer();