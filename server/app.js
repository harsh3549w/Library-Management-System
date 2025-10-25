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
import { globalErrorHandler, handleUnhandledRoutes } from "./utils/errorHandler.js";
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
import recommendationRouter from './routes/recommendationRouter.js';
import donationRouter from './routes/donationRouter.js';
import adminRouter from './routes/adminRoutes.js';
import { notifyOverdueBooks } from './services/notifyUsers.js';
import { expireOldReservations } from './services/reservationService.js';
import { processAllocationQueue } from './services/autoAllocationService.js';

export const app = express();

// Trust proxy - important for AWS/production environments
app.set('trust proxy', 1);

const requiredEnvVars = ["PORT", "MONGO_URI", "JWT_SECRET_KEY", "FRONTEND_URL"];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

// Initialize notification services (only overdue books, daily emails removed)
if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
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
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'https://library-management-system-gamma-sable.vercel.app'
].filter(Boolean); // Remove undefined values

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

// Rate limiting - stricter for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 100 requests per 15 minutes in production
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Use X-Forwarded-For header if available (for proxies), otherwise use IP
    return req.ip;
  }
});

app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 minutes (increased from 5)
  message: "Too many login attempts, please try again later",
  skipSuccessfulRequests: true, // Don't count successful logins
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/v1/auth/login", authLimiter);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));
app.use(helmet.xssFilter());
app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.noSniff());
app.use(helmet.hidePoweredBy());

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
app.use('/api/v1/recommendations', recommendationRouter);
app.use('/api/v1/donation', donationRouter);
app.use('/api/v1/admin', adminRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// 404 handler for undefined routes
app.use(handleUnhandledRoutes);

// Error handling middleware (must be last)
app.use(globalErrorHandler);
