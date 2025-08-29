import mongoose from "mongoose";

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "MERN_STACK_LIBRARY_MANAGEMENT",
    })
    .then(() => {
      console.log("Database connected successfully ✅");
    })
    .catch((err) => {
      console.log(`Database connection failed ❌: ${err}`);
    });
};
