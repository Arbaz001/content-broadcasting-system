// ============================================================
// Content Service — Content upload and management logic
// ============================================================

const { Op } = require('sequelize');
const { Content, User, ContentSlot, ContentSchedule } = require('../models');
const ApiError = require('../utils/apiError');
const { CONTENT_STATUS, PAGINATION } = require('../utils/constants');

/**
 * Upload new content (Teacher action).
 * Content is created with 'pending' status awaiting Principal approval.
 *
 * @param {object} data - Content fields from request body
 * @param {object} file - Multer file object
 * @param {number} teacherId - ID of the uploading teacher
 * @returns {object} - Created content record
 */
async function uploadContent(data, file, teacherId) {
  if (!file) {
    throw ApiError.badRequest('File is required. Please upload a JPG, PNG, or GIF image.');
  }

  // Create content record
  const content = await Content.create({
    title: data.title,
    description: data.description || null,
    subject: data.subject,
    file_url: `/uploads/${file.filename}`,
    file_type: file.mimetype,
    file_size: file.size,
    uploaded_by: teacherId,
    status: CONTENT_STATUS.PENDING,
    start_time: data.start_time || null,
    end_time: data.end_time || null,
    rotation_duration: data.rotation_duration || 5,
  });

  // Ensure a ContentSlot exists for this subject
  await ContentSlot.findOrCreate({
    where: { subject: data.subject },
    defaults: { subject: data.subject },
  });

  // Return content with uploader info
  const fullContent = await Content.findByPk(content.id, {
    include: [
      {
        model: User,
        as: 'uploader',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return fullContent;
}

/**
 * Get all content uploaded by a specific teacher.
 *
 * @param {number} teacherId
 * @param {object} query - Pagination and filter parameters
 * @returns {object} - { rows, count, pagination }
 */
async function getTeacherContent(teacherId, query = {}) {
  const page = parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const offset = (page - 1) * limit;

  const where = { uploaded_by: teacherId };

  if (query.subject) {
    where.subject = query.subject;
  }

  if (query.status) {
    where.status = query.status;
  }

  const { rows, count } = await Content.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'approver',
        attributes: ['id', 'name'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    content: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Get single content by ID (with ownership check for teachers).
 *
 * @param {number} contentId
 * @param {number|null} teacherId - If provided, ensure the content belongs to this teacher
 * @returns {object} - Content record
 */
async function getContentById(contentId, teacherId = null) {
  const where = { id: contentId };

  if (teacherId) {
    where.uploaded_by = teacherId;
  }

  const content = await Content.findOne({
    where,
    include: [
      {
        model: User,
        as: 'uploader',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: User,
        as: 'approver',
        attributes: ['id', 'name'],
      },
    ],
  });

  if (!content) {
    throw ApiError.notFound('Content not found.');
  }

  return content;
}

/**
 * Get all content (Principal view) with pagination and filters.
 *
 * @param {object} query - { page, limit, subject, status }
 * @returns {object} - { content, pagination }
 */
async function getAllContent(query = {}) {
  const page = parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const offset = (page - 1) * limit;

  const where = {};

  if (query.subject) {
    where.subject = query.subject;
  }

  if (query.status) {
    where.status = query.status;
  }

  const { rows, count } = await Content.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'uploader',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: User,
        as: 'approver',
        attributes: ['id', 'name'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    content: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Get pending content (Principal view).
 *
 * @param {object} query - Pagination parameters
 * @returns {object} - { content, pagination }
 */
async function getPendingContent(query = {}) {
  return getAllContent({ ...query, status: CONTENT_STATUS.PENDING });
}

module.exports = {
  uploadContent,
  getTeacherContent,
  getContentById,
  getAllContent,
  getPendingContent,
};
