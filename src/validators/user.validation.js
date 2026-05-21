import Joi from 'joi';
import { validateRequest } from './validation.runner.js';
import { VALIDATION_ERRORS } from '../utils/constants.js';

export const updateUserProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    'string.min': VALIDATION_ERRORS.NAME_MIN,
    'string.max': VALIDATION_ERRORS.NAME_MAX,
  }),
  email: Joi.string().email().optional().messages({
    'string.email': VALIDATION_ERRORS.EMAIL_INVALID,
  }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': VALIDATION_ERRORS.CURRENT_PASSWORD_REQUIRED,
  }),
  newPassword: Joi.string().min(8).required().messages({
    'any.required': VALIDATION_ERRORS.NEW_PASSWORD_REQUIRED,
    'string.min': VALIDATION_ERRORS.NEW_PASSWORD_MIN,
  }),
});

// Specific Express middlewares for User validation
export const validateUpdateProfile = validateRequest(updateUserProfileSchema, 'body');
export const validateChangePassword = validateRequest(changePasswordSchema, 'body');

export default {
  validateUpdateProfile,
  validateChangePassword,
  updateUserProfileSchema,
  changePasswordSchema,
};
