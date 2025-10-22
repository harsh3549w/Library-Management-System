import { catchAsyncErrors } from "./catchAsyncErrors.js";
import { ErrorHandler } from "./errorMiddlewares.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    // Check for token in cookies or Authorization header
    let token = req.cookies.token;
    
    // If no token in cookies, check Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    console.log("Auth middleware - token:", token ? "present" : "missing");
    console.log("Auth middleware - source:", req.cookies.token ? "cookie" : req.headers.authorization ? "header" : "none");
    
    if (!token) {
        return next(new ErrorHandler("Please login to access", 401));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    
    console.log("Auth middleware - user found:", !!req.user);
    next();
});

export const isAuthorized = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `User with role ${req.user.role} not allowed to access this resource`,
                    403
                )
            );
        }
        next();
    };
};