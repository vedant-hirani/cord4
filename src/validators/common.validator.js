import Joi from 'joi';

// Joi custom helper matching Mongoose ObjectId hex patterns
export const objectIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid MongoDB ObjectId format'
});

export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').optional(),
});

export default {
  objectIdSchema,
  paginationQuerySchema,
};
