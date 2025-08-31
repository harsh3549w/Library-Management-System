import { v2 as cloudinary } from "cloudinary";
import { app } from "./app.js";

// Validate Cloudinary environment variables before starting
const cloudinaryVars = ["CLOUDINARY_CLIENT_NAME", "CLOUDINARY_CLIENT_API", "CLOUDINARY_CLIENT_SECRET"];
for (const varName of cloudinaryVars) {
  if (!process.env[varName]) {
    console.error(`Missing required Cloudinary environment variable: ${varName}`);
    process.exit(1);
  }
}
import { connectDB } from "./database/db.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
  secure: true
});

const startServer = async () => {
  try {
    console.log("Starting server with configuration:");
    console.log(`PORT: ${process.env.PORT}`);
    console.log(`DB: ${process.env.MONGO_URI ? "Configured" : "Missing"}`);
    
    await connectDB();
    
    const server = app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
    
    process.on("unhandledRejection", (err) => {
      console.error("Unhandled Rejection:", err);
      server.close(() => process.exit(1));
    });
    
  } catch (err) {
    console.error("Fatal startup error:");
    console.error(err);
    process.exit(1);
  }
};

startServer();