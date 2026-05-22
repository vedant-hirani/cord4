import Joi from 'joi';
import { validateRequest } from './validation.runner.js';

export const setBudgetSchema = Joi.object({
  limit: Joi.number().min(0).required().messages({
    'any.required': 'Budget limit is required',
    'number.min': 'Limit must be greater than or equal to 0',
  }),
  category: Joi.string()
    .valid('Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Other')
    .required()
    .messages({
      'any.required': 'Budget category is required',
      'any.only': 'Invalid category choice. Allowed: Food, Transport, Utilities, Entertainment, Shopping, Other',
    }),
  month: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required()
    .messages({
      'any.required': 'Budget month is required (YYYY-MM)',
      'string.pattern.base': 'Budget month must match YYYY-MM format (e.g. 2026-05)',
    }),
});

export const validateSetBudget = validateRequest(setBudgetSchema, 'body');

export default {
  validateSetBudget,
  setBudgetSchema,
};
