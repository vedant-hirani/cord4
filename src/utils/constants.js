export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MANAGER: 'manager',
};

export const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
};

export const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export const VALIDATION_ERRORS = {
  NAME_REQUIRED: 'Name is required',
  NAME_MIN: 'Name must be at least 2 characters long',
  NAME_MAX: 'Name must not exceed 50 characters',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Invalid email address format',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_STRENGTH: 'Password must be 8-128 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
  CURRENT_PASSWORD_REQUIRED: 'Current password is required',
  NEW_PASSWORD_REQUIRED: 'New password is required',
  NEW_PASSWORD_MIN: 'New password must be at least 8 characters long',
  RECIPIENT_NAME_REQUIRED: 'Recipient name is required',
  NOTIFICATION_CHANNELS_REQUIRED: 'At least one notification channel is required',
};

export const SUCCESS_MESSAGES = {
  REGISTER: 'User account registered successfully',
  LOGIN: 'User login successful',
  REFRESH_TOKEN: 'Access token renewed successfully',
  LOGOUT: 'User logged out successfully',
  GET_PROFILE: 'Profile retrieved successfully',
  UPDATE_PROFILE: 'Profile updated successfully',
  CHANGE_PASSWORD: 'Password changed successfully',
  LIST_USERS: 'Users listing retrieved successfully',
  SEND_NOTIFICATION: 'System notifications dispatched successfully',
  CREATE_EXPENSE: 'Expense record created successfully',
  UPDATE_EXPENSE: 'Expense record updated successfully',
  DELETE_EXPENSE: 'Expense record deleted successfully',
  LIST_EXPENSES: 'Expenses listed successfully',
  GET_STATS: 'Dashboard analytics retrieved successfully',
  SET_BUDGET: 'Budget threshold configured successfully',
  GET_ALERTS: 'Budget status alerts retrieved successfully',
  AI_EXTRACT: 'AI expense extraction completed successfully',
};

export default {
  ROLES,
  USER_STATUS,
  NOTIFICATION_TYPES,
  HTTP_STATUS,
  VALIDATION_ERRORS,
  SUCCESS_MESSAGES,
};
