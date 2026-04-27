// ============================================================
// Auth Validation — Joi schemas for auth endpoints
// ============================================================

const Joi = require('joi');
const { ROLES } = require('../utils/constants');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 100 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.max': 'Password must not exceed 128 characters',
    'any.required': 'Password is required',
  }),
  role: Joi.string()
    .valid(ROLES.PRINCIPAL, ROLES.TEACHER)
    .required()
    .messages({
      'any.only': `Role must be either ${ROLES.PRINCIPAL} or ${ROLES.TEACHER}`,
      'any.required': 'Role is required',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
