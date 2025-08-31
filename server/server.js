import { config } from "dotenv";
config({ path: "./config/config.env" });

import { v2 as cloudinary } from "cloudinary";
import { app } from "./app.js";
import { connectDB } from "./database/db.js";

// Validate Cloudinary environment variables
const cloudinaryVars = ["CLOUDINARY_CLIENT_NAME", "CLOUDINARY_CLIENT_API", "CLOUDINARY_CLIENT_SECRET"];
for (const varName of cloudinaryVars) {
  if (!process.env[varName]) {
    console.error(`Missing required Cloudinary environment variable: ${varName}`);
    process.exit(1);
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
  secure: true,
});

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
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