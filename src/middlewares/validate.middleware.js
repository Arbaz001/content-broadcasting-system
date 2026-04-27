// ============================================================
// Validate Middleware — Generic Joi validation
// ============================================================

const ApiError = require('../utils/apiError');

/**
 * Factory function that returns middleware for Joi schema validation.
 * @param {object} schema - Joi validation schema
 * @param {string} source - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false, // Collect all errors
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return next(ApiError.badRequest('Validation failed', errorMessages));
    }

    // Replace request data with validated/sanitized data
    req[source] = value;
    next();
  };
};

module.exports = { validate };
