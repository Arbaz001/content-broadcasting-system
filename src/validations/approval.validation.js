// ============================================================
// Approval Validation — Joi schemas for approval endpoints
// ============================================================

const Joi = require('joi');

const rejectContentSchema = Joi.object({
  rejection_reason: Joi.string().min(5).max(1000).required().messages({
    'string.min': 'Rejection reason must be at least 5 characters',
    'string.max': 'Rejection reason must not exceed 1000 characters',
    'any.required': 'Rejection reason is required',
  }),
});

module.exports = {
  rejectContentSchema,
};
