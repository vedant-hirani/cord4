/**
 * Low-level utility helper that validates request payloads against Joi schemas.
 * @param {Object} schema Joi validation schema object
 * @param {string} [location='body'] Request payload container ('body', 'query', or 'params')
 * @returns {Function} Express middleware function
 */
export const validateRequest = (schema, location = 'body') => (req, res, next) => {
  if (!schema) return next();

  const options = {
    abortEarly: false, // Include all errors, do not abort on first failure
    allowUnknown: true, // Allow unknown headers/keys not defined in schema
    stripUnknown: true, // Remove keys not defined in schema
  };

  const { error, value } = schema.validate(req[location], options);

  if (error) {
    // Forward Joi validation error to global error handler
    return next(error);
  }

  // Replace raw request values with validated and sanitized Joi outputs
  req[location] = value;
  return next();
};

export default validateRequest;
