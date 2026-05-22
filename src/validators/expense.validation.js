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

export const validateCreateExpense = validateRequest(createExpenseSchema, 'body');
export const validateUpdateExpense = validateRequest(updateExpenseSchema, 'body');

export default {
  validateCreateExpense,
  validateUpdateExpense,
  createExpenseSchema,
  updateExpenseSchema,
};
