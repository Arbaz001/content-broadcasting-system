// ============================================================
// ApiResponse — Standardized API response helpers
// ============================================================

class ApiResponse {
  /**
   * Send a success response.
   * @param {object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default 200)
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send a created response (201).
   */
  static created(res, data = null, message = 'Created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }

  /**
   * Send an error response.
   * @param {object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default 500)
   * @param {Array} errors - Optional validation errors
   */
  static error(res, message = 'Something went wrong', statusCode = 500, errors = []) {
    const response = {
      success: false,
      message,
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send a paginated response.
   */
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}

module.exports = ApiResponse;
