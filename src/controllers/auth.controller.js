// ============================================================
// Auth Controller — Handle authentication requests
// ============================================================

const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * POST /api/auth/register
 * Register a new user.
 */
async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return ApiResponse.created(res, result, 'User registered successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Login with email and password.
 */
async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return ApiResponse.success(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Get current user's profile.
 */
async function getProfile(req, res, next) {
  try {
    const profile = await authService.getProfile(req.user.id);
    return ApiResponse.success(res, profile, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile,
};
