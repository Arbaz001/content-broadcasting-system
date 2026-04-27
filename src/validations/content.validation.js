// ============================================================
// Content Validation — Joi schemas for content endpoints
// ============================================================

const Joi = require('joi');
const { SUBJECTS } = require('../utils/constants');

const uploadContentSchema = Joi.object({
  title: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Title must be at least 2 characters',
    'string.max': 'Title must not exceed 255 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().max(2000).optional().allow('', null).messages({
    'string.max': 'Description must not exceed 2000 characters',
  }),
  subject: Joi.string()
    .valid(...SUBJECTS)
    .required()
    .messages({
      'any.only': `Subject must be one of: ${SUBJECTS.join(', ')}`,
      'any.required': 'Subject is required',
    }),
  start_time: Joi.date().iso().optional().allow(null).messages({
    'date.format': 'Start time must be a valid ISO date',
  }),
  end_time: Joi.date().iso().optional().allow(null).greater(Joi.ref('start_time')).messages({
    'date.format': 'End time must be a valid ISO date',
    'date.greater': 'End time must be after start time',
  }),
  rotation_duration: Joi.number().integer().min(1).max(1440).optional().messages({
    'number.min': 'Rotation duration must be at least 1 minute',
    'number.max': 'Rotation duration must not exceed 1440 minutes (24 hours)',
  }),
});

const contentQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  subject: Joi.string()
    .valid(...SUBJECTS)
    .optional(),
  status: Joi.string().valid('uploaded', 'pending', 'approved', 'rejected').optional(),
});

module.exports = {
  uploadContentSchema,
  contentQuerySchema,
};
