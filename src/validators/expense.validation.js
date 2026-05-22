import Joi from 'joi';
import { validateRequest } from './validation.runner.js';

export const createExpenseSchema = Joi.object({
  amount: Joi.number().min(0).required().messages({
    'any.required': 'Expense amount is required',
    'number.min': 'Amount must be greater than or equal to 0',
  }),
  category: Joi.string()
    .valid('Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Other')
    .required()
    .messages({
      'any.required': 'Expense category is required',
      'any.only': 'Invalid category choice. Allowed: Food, Transport, Utilities, Entertainment, Shopping, Other',
    }),
  date: Joi.date().iso().required().messages({
    'any.required': 'Transaction date is required',
    'date.format': 'Invalid transaction date format (ISO Date required)',
  }),
  note: Joi.string().allow('').max(250).optional(),
});

export const updateExpenseSchema = Joi.object({
  amount: Joi.number().min(0).optional(),
  category: Joi.string()
    .valid('Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Other')
    .optional(),
  date: Joi.date().iso().optional(),
  note: Joi.string().allow('').max(250).optional(),
});

// Query params validator for GET /expenses
export const listExpensesQuerySchema = Joi.object({
  // Pagination
  page:      Joi.number().integer().min(1).default(1),
  limit:     Joi.number().integer().min(1).max(100).default(20),
  // Date filters — mutually exclusive groups, all optional
  month:     Joi.string().pattern(/^\d{4}-(0[1-9]|1[0-2])$/).optional()
               .messages({ 'string.pattern.base': 'month must be in YYYY-MM format (e.g. 2026-05)' }),
  year:      Joi.string().pattern(/^\d{4}$/).optional()
               .messages({ 'string.pattern.base': 'year must be a 4-digit number (e.g. 2026)' }),
  startDate: Joi.date().iso().optional(),
  endDate:   Joi.date().iso().min(Joi.ref('startDate')).optional()
               .messages({ 'date.min': 'endDate must be on or after startDate' }),
  // Category filter
  category:  Joi.string()
               .valid('Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Other')
               .optional()
               .messages({ 'any.only': 'Invalid category. Allowed: Food, Transport, Utilities, Entertainment, Shopping, Other' }),
});

export const validateCreateExpense  = validateRequest(createExpenseSchema,      'body');
export const validateUpdateExpense  = validateRequest(updateExpenseSchema,       'body');
export const validateListExpenses   = validateRequest(listExpensesQuerySchema,   'query');

export default {
  validateCreateExpense,
  validateUpdateExpense,
  validateListExpenses,
  createExpenseSchema,
  updateExpenseSchema,
  listExpensesQuerySchema,
};
