// ============================================================
// Role Middleware — RBAC enforcement
// ============================================================

const ApiError = require('../utils/apiError');

/**
 * Factory function that returns middleware enforcing role-based access.
 * @param  {...string} allowedRoles - Roles permitted to access the route
 * @returns {Function} Express middleware
 *
 * Usage: authorize('principal'), authorize('teacher'), authorize('principal', 'teacher')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated first
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required.');
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        throw ApiError.forbidden(
          `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authorize };
