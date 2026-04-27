// ============================================================
// Error Middleware — Global error handler
// ============================================================

const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

/**
 * Global error handling middleware.
 * Converts all errors into structured API responses.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
    });
  }

  // Handle known ApiError instances
  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return ApiResponse.error(res, 'Validation error', 400, messages);
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message);
    return ApiResponse.error(res, 'Duplicate entry', 409, messages);
  }

  // Handle Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return ApiResponse.error(res, 'Referenced record does not exist', 400);
  }

  // Handle JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return ApiResponse.error(res, 'Invalid JSON in request body', 400);
  }

  // Handle unexpected errors
  return ApiResponse.error(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    500
  );
};

/**
 * 404 handler for undefined routes.
 */
const notFoundHandler = (req, res) => {
  return ApiResponse.error(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
};

module.exports = { errorHandler, notFoundHandler };
