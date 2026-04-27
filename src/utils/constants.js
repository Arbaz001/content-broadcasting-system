// ============================================================
// Constants — Enums, allowed values, and configuration defaults
// ============================================================

/**
 * User roles in the system.
 * - principal: Can approve/reject content
 * - teacher: Can upload content
 */
const ROLES = Object.freeze({
  PRINCIPAL: 'principal',
  TEACHER: 'teacher',
});

/**
 * Content lifecycle statuses.
 * uploaded → pending → approved / rejected
 */
const CONTENT_STATUS = Object.freeze({
  UPLOADED: 'uploaded',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

/**
 * Allowed subjects for content.
 */
const SUBJECTS = Object.freeze([
  'maths',
  'science',
  'english',
  'history',
  'geography',
  'computer_science',
  'physics',
  'chemistry',
  'biology',
  'economics',
]);

/**
 * Allowed file types for upload.
 */
const ALLOWED_FILE_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/gif']);
const ALLOWED_EXTENSIONS = Object.freeze(['.jpg', '.jpeg', '.png', '.gif']);

/**
 * Upload constraints.
 */
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024; // 10MB

/**
 * Default rotation duration in minutes.
 */
const DEFAULT_ROTATION_DURATION = 5;

/**
 * Pagination defaults.
 */
const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
});

module.exports = {
  ROLES,
  CONTENT_STATUS,
  SUBJECTS,
  ALLOWED_FILE_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  DEFAULT_ROTATION_DURATION,
  PAGINATION,
};
