// error.js

// Custom Error Handler Class
class ErrorHandler extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true; // Mark as operational error
      
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // Error Middleware
  export const errorMiddleware = (err, req, res, next) => {
    // Default values
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;
  
    // Duplicate Key Error (MongoDB)
    if (err.code === 11000) {
      const message = "Duplicate Field Value Entered";
      err = new ErrorHandler(message, 400);
    }
  
    // Invalid JWT Token
    if (err.name === "JsonWebTokenError") {
      const message = "Json Web Token is invalid. Try again.";
      err = new ErrorHandler(message, 400);
    }
  
    // Expired JWT Token
    if (err.name === "TokenExpiredError") {
      const message = "Json Web Token is expired. Try again.";
      err = new ErrorHandler(message, 400);
    }
  
    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid: ${err.path}`;
      err = new ErrorHandler(message, 400);
    }
  
    // Mongoose Validation Error
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((value) => value.message)
        .join(", ");
      err = new ErrorHandler(message, 400);
    }
  
    // Send Error Response
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  };
  
  export { ErrorHandler };
  