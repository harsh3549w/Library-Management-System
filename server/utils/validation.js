/**
 * Simple email validation
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Simple password validation
 */
export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
  return passwordRegex.test(password);
};

/**
 * Simple phone validation
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

/**
 * Simple MongoDB ObjectId validation
 */
export const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
    .substring(0, 1000); // Limit length
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (page, limit) => {
  const validPage = Math.max(1, parseInt(page) || 1);
  const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
  return { page: validPage, limit: validLimit };
};

/**
 * Validate sort parameters
 */
export const validateSort = (sort, allowedFields) => {
  if (!sort || !allowedFields.includes(sort)) {
    return allowedFields[0]; // Default to first allowed field
  }
  return sort;
};

/**
 * Validate order parameters
 */
export const validateOrder = (order) => {
  return order === 'asc' ? 'asc' : 'desc';
};
