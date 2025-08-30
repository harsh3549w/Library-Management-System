import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./database/db.js";
import { errorMiddleware, ErrorHandler } from "./middlewares/errorMiddlewares.js";
import authRouter from "./routes/authRouter.js";

export const app = express();

// Load environment variables
config({ path: "./config/config.env" });

// Enable CORS
const allowedOrigins = [process.env.FRONTEND_URL];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRouter);

// 404 handler for undefined routes
app.use((req, res, next) => {
  const err = new ErrorHandler(`Route ${req.originalUrl} not found`, 404);
  next(err);
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

connectDB();