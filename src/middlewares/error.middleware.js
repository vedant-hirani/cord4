import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

export const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Check if error is an instance of ApiError, if not convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  // Format Joi Validation errors nicely
  if (err.isJoi || err.name === 'ValidationError') {
    const formattedErrors = (err.details || []).map((e) => ({
      field: e.path.join('.'),
      message: e.message.replace(/['"]/g, ''), // Clean up Joi double quotes
    }));
    error = new ApiError(400, 'Validation failed', formattedErrors, err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  // Structured Logging via Winston
  logger.error(
    `[${req.method}] ${req.originalUrl} - Status: ${error.statusCode} - Error: ${error.message}`
  );
  if (env.NODE_ENV === 'development' && error.stack) {
    logger.debug(error.stack);
  }

  return res.status(error.statusCode).json(response);
};

export default errorMiddleware;
