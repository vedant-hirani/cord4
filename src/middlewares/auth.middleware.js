import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user/user.model.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Retrieve token from Authorization Bearer header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication token missing. Access denied.');
  }

  try {
    // Verify token integrity
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Fetch matching user and append to request context
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new ApiError(401, 'User associated with this token no longer exists.');
    }

    if (user.status === 'suspended') {
      throw new ApiError(403, 'Your account has been suspended. Please contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Your session has expired. Please log in again.');
    }
    throw new ApiError(401, 'Invalid authentication token.');
  }
});

/**
 * Restricts access to specified role categories.
 * @param {...string} roles Permitted role list
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'Permission denied. You do not have access to this resource.');
    }
    next();
  };
};

export default {
  protect,
  restrictTo,
};
