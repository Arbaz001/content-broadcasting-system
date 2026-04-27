// ============================================================
// Auth Service — Authentication business logic
// ============================================================

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/apiError');

/**
 * Register a new user (Principal or Teacher).
 * @param {object} data - { name, email, password, role }
 * @returns {object} - { user, token }
 */
async function register({ name, email, password, role }) {
  // Check if email already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw ApiError.conflict('A user with this email already exists.');
  }

  // Create user (password is hashed via beforeCreate hook)
  const user = await User.create({
    name,
    email,
    password_hash: password,
    role,
  });

  // Generate JWT
  const token = generateToken(user);

  return {
    user: user.toSafeObject(),
    token,
  };
}

/**
 * Login with email and password.
 * @param {object} data - { email, password }
 * @returns {object} - { user, token }
 */
async function login({ email, password }) {
  // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Validate password
  const isValidPassword = await user.validatePassword(password);
  if (!isValidPassword) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Generate JWT
  const token = generateToken(user);

  return {
    user: user.toSafeObject(),
    token,
  };
}

/**
 * Get user profile by ID.
 * @param {number} userId
 * @returns {object} - Sanitized user object
 */
async function getProfile(userId) {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password_hash'] },
  });

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  return user.toSafeObject();
}

/**
 * Generate a JWT token for the given user.
 * @param {object} user - User instance
 * @returns {string} - JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    }
  );
}

module.exports = {
  register,
  login,
  getProfile,
};
