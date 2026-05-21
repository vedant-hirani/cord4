import Joi from 'joi';
import { validateRequest } from './validation.runner.js';
import { VALIDATION_ERRORS } from '../utils/constants.js';

// Regex: Min 8, max 128, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,128}$/;

const passwordSchema = Joi.string()
  .required()
  .pattern(passwordPattern)
  .messages({
    'string.pattern.base': VALIDATION_ERRORS.PASSWORD_STRENGTH,
    'any.required': VALIDATION_ERRORS.PASSWORD_REQUIRED,
  });

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'any.required': VALIDATION_ERRORS.NAME_REQUIRED,
    'string.min': VALIDATION_ERRORS.NAME_MIN,
    'string.max': VALIDATION_ERRORS.NAME_MAX,
  }),
  email: Joi.string().email().required().messages({
    'any.required': VALIDATION_ERRORS.EMAIL_REQUIRED,
    'string.email': VALIDATION_ERRORS.EMAIL_INVALID,
  }),
  password: passwordSchema,
  role: Joi.string().valid('user', 'admin', 'manager').default('user'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': VALIDATION_ERRORS.EMAIL_REQUIRED,
    'string.email': VALIDATION_ERRORS.EMAIL_INVALID,
  }),
  password: Joi.string().required().messages({
    'any.required': VALIDATION_ERRORS.PASSWORD_REQUIRED,
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': VALIDATION_ERRORS.REFRESH_TOKEN_REQUIRED,
  }),
});

// Specific Express middlewares for Auth validation
export const validateRegister = validateRequest(registerSchema, 'body');
export const validateLogin = validateRequest(loginSchema, 'body');
export const validateRefreshToken = validateRequest(refreshTokenSchema, 'body');

export default {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
};
