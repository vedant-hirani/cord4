import { validateRegister, validateLogin, validateRefreshToken } from './auth.validation.js';
import { validateUpdateProfile, validateChangePassword } from './user.validation.js';
import { validateSendNotification } from './notification.validation.js';
import { validateCreateExpense, validateUpdateExpense } from './expense.validation.js';
import { validateSetBudget } from './budget.validation.js';
import { validateExtract } from './ai.validation.js';
import { validateRequest } from './validation.runner.js';

// Central re-exports of specific route validator middlewares
export {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateUpdateProfile,
  validateChangePassword,
  validateSendNotification,
  validateCreateExpense,
  validateUpdateExpense,
  validateSetBudget,
  validateExtract,
  validateRequest,
};

export default {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateUpdateProfile,
  validateChangePassword,
  validateSendNotification,
  validateCreateExpense,
  validateUpdateExpense,
  validateSetBudget,
  validateExtract,
  validateRequest,
};
