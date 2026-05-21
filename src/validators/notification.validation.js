import Joi from 'joi';
import { validateRequest } from './validation.runner.js';
import { VALIDATION_ERRORS } from '../utils/constants.js';

export const sendNotificationSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': VALIDATION_ERRORS.RECIPIENT_NAME_REQUIRED,
    'string.empty': VALIDATION_ERRORS.RECIPIENT_NAME_REQUIRED,
  }),
  email: Joi.string().email().optional().messages({
    'string.email': VALIDATION_ERRORS.EMAIL_INVALID,
  }),
  phone: Joi.string().optional(),
  fcmToken: Joi.string().optional(),
  channels: Joi.array().items(Joi.string().valid('email', 'sms', 'push')).min(1).required().messages({
    'array.min': VALIDATION_ERRORS.NOTIFICATION_CHANNELS_REQUIRED,
    'any.required': VALIDATION_ERRORS.NOTIFICATION_CHANNELS_REQUIRED,
  }),
});

// Specific Express middleware for Notification validation
export const validateSendNotification = validateRequest(sendNotificationSchema, 'body');

export default {
  validateSendNotification,
  sendNotificationSchema,
};
