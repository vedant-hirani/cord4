import { validateRegister, validateLogin, validateRefreshToken } from './auth.validation.js';
import { validateUpdateProfile, validateChangePassword } from './user.validation.js';
import { validateSendNotification } from './notification.validation.js';
import { validateCreateExpense, validateUpdateExpense, validateListExpenses } from './expense.validation.js';
import { validateSetBudget, validateListBudgets, validateDeleteBudget } from './budget.validation.js';
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
  validateListExpenses,
  validateSetBudget,
  validateListBudgets,
  validateDeleteBudget,
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
  validateListExpenses,
  validateSetBudget,
  validateListBudgets,
  validateDeleteBudget,
  validateExtract,
  validateRequest,
};
