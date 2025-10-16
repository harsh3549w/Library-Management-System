import express from "express";
import { config } from "dotenv";

config({ path: "./config/config.env" });
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import { errorMiddleware, ErrorHandler } from "./middlewares/errorMiddlewares.js";
import authRouter from "./routes/authRouter.js";
import bookRouter from "./routes/bookRouter.js";
import borrowRouter from "./routes/borrowRouter.js";
import userRouter from "./routes/userRouter.js";
import clientRouter from './routes/clientRouter.js';
import suggestionRouter from './routes/suggestionRouter.js';
import reservationRouter from './routes/reservationRouter.js';
import archiveRouter from './routes/archiveRouter.js';
import transactionRouter from './routes/transactionRouter.js';
import reportRouter from './routes/reportRouter.js';
import paymentRouter from './routes/paymentRouter.js';
import { notifyUsers, notifyOverdueBooks } from './services/notifyUsers.js';
import { expireOldReservations } from './services/reservationService.js';
import { processAllocationQueue } from './services/autoAllocationService.js';

export const app = express();


const requiredEnvVars = ["PORT", "MONGO_URI", "JWT_SECRET_KEY", "FRONTEND_URL"];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

// Initialize notification services
if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
  notifyUsers();
  notifyOverdueBooks();
} else {
  console.warn('Notification services disabled - missing email configuration');
}

// Initialize reservation expiry service
expireOldReservations();

// Initialize auto-allocation service (runs every 5 minutes)
setInterval(processAllocationQueue, 5 * 60 * 1000);
console.log('Auto-allocation service initialized - checking every 5 minutes');

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: "Too many requests from this IP, please try again later"
});

app.use(limiter);

// Security headers
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.frameguard({ action: "deny" }));

// Request logging
app.use(morgan("dev"));

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/"
}));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/book", bookRouter);
app.use("/api/v1/borrow", borrowRouter);
app.use("/api/v1/users", userRouter);
app.use('/api/v1/client', clientRouter);
app.use('/api/v1/suggestion', suggestionRouter);
app.use('/api/v1/reservation', reservationRouter);
app.use('/api/v1/archive', archiveRouter);
app.use('/api/v1/transaction', transactionRouter);
app.use('/api/v1/report', reportRouter);
app.use('/api/v1/payment', paymentRouter);

// 404 handler for undefined routes
app.use((req, res, next) => {
  const err = new ErrorHandler(`Route ${req.originalUrl} not found`, 404);
  next(err);
});

// Error handling middleware (must be last)
app.use(errorMiddleware);
