import { validateRegister, validateLogin, validateRefreshToken } from './auth.validation.js';
import { validateUpdateProfile, validateChangePassword } from './user.validation.js';
import { validateSendNotification } from './notification.validation.js';
import { validateRequest } from './validation.runner.js';

// Central re-exports of specific route validator middlewares
export {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateUpdateProfile,
  validateChangePassword,
  validateSendNotification,
  validateRequest,
};

export default {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateUpdateProfile,
  validateChangePassword,
  validateSendNotification,
  validateRequest,
};
