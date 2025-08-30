import { app } from "./app.js";
import { connectDB } from "./database/db.js";

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