// ============================================================
// Auth Middleware — JWT verification
// ============================================================

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/apiError');

/**
 * Middleware to authenticate requests using JWT.
 * Extracts the token from the Authorization header (Bearer <token>),
 * verifies it, and attaches the user to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Access denied. Invalid token format.');
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Token has expired. Please login again.');
      }
      if (err.name === 'JsonWebTokenError') {
        throw ApiError.unauthorized('Invalid token.');
      }
      throw ApiError.unauthorized('Token verification failed.');
    }

    // 3. Find user in database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists.');
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticate };
