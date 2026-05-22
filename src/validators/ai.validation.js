import Joi from 'joi';
import { validateRequest } from './validation.runner.js';

export const extractSchema = Joi.object({
  rawText: Joi.string().required().min(5).messages({
    'any.required': 'rawText string is required',
    'string.empty': 'rawText cannot be empty',
    'string.min': 'rawText must be at least 5 characters long',
  }),
});

export const validateExtract = validateRequest(extractSchema, 'body');

export default {
  validateExtract,
  extractSchema,
};
