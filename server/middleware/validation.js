import Joi from 'joi';
import { AppError } from '../utils/errorHandler.js';

/**
 * Generic validation middleware
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(new AppError(errorMessage, 400));
    }
    next();
  };
};

/**
 * User registration validation
 */
export const validateUserRegistration = validate(
  Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      }),
    role: Joi.string().valid('User', 'Admin').default('User'),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    address: Joi.string().max(200).optional(),
  })
);

/**
 * User login validation
 */
export const validateUserLogin = validate(
  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  })
);

/**
 * Book creation validation
 */
export const validateBookCreation = validate(
  Joi.object({
    title: Joi.string().min(1).max(200).required(),
    author: Joi.string().min(1).max(100).required(),
    isbn: Joi.string().pattern(/^[0-9]{13}$/).optional(),
    genre: Joi.string().min(1).max(50).required(),
    description: Joi.string().max(1000).optional(),
    quantity: Joi.number().integer().min(1).required(),
    availability: Joi.boolean().default(true),
    publishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
    publisher: Joi.string().max(100).optional(),
  })
);

/**
 * Book update validation
 */
export const validateBookUpdate = validate(
  Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    author: Joi.string().min(1).max(100).optional(),
    isbn: Joi.string().pattern(/^[0-9]{13}$/).optional(),
    genre: Joi.string().min(1).max(50).optional(),
    description: Joi.string().max(1000).optional(),
    quantity: Joi.number().integer().min(0).optional(),
    availability: Joi.boolean().optional(),
    publishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
    publisher: Joi.string().max(100).optional(),
  })
);

/**
 * Borrow book validation
 */
export const validateBorrowBook = validate(
  Joi.object({
    bookId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    borrowDate: Joi.date().optional(),
    dueDate: Joi.date().min('now').optional(),
  })
);

/**
 * Reservation validation
 */
export const validateReservation = validate(
  Joi.object({
    bookId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    priority: Joi.number().integer().min(1).max(10).default(5),
  })
);

/**
 * Suggestion validation
 */
export const validateSuggestion = validate(
  Joi.object({
    title: Joi.string().min(1).max(200).required(),
    author: Joi.string().min(1).max(100).required(),
    genre: Joi.string().min(1).max(50).required(),
    reason: Joi.string().min(10).max(500).required(),
    priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
  })
);

/**
 * Payment validation
 */
export const validatePayment = validate(
  Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().valid('INR').default('INR'),
    description: Joi.string().max(200).optional(),
  })
);

/**
 * Email validation
 */
export const validateEmail = validate(
  Joi.object({
    email: Joi.string().email().required(),
  })
);

/**
 * Password reset validation
 */
export const validatePasswordReset = validate(
  Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
      .messages({
        'any.only': 'Confirm password must match password'
      }),
  })
);

/**
 * OTP validation
 */
export const validateOTP = validate(
  Joi.object({
    otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  })
);

/**
 * Query parameter validation for pagination
 */
export const validatePagination = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('createdAt', 'title', 'author', 'dueDate').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new AppError(errorMessage, 400));
  }
  next();
};
