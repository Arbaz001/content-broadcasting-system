// ============================================================
// Content Controller — Handle content management requests
// ============================================================

const contentService = require('../services/content.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * POST /api/content/upload
 * Upload new content (Teacher only).
 */
async function uploadContent(req, res, next) {
  try {
    const content = await contentService.uploadContent(req.body, req.file, req.user.id);
    return ApiResponse.created(res, content, 'Content uploaded successfully. Pending approval.');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/content/my
 * Get content uploaded by the logged-in teacher.
 */
async function getMyContent(req, res, next) {
  try {
    const result = await contentService.getTeacherContent(req.user.id, req.query);
    return ApiResponse.paginated(
      res,
      result.content,
      result.pagination,
      'Teacher content retrieved'
    );
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/content/:id
 * Get single content by ID (Teacher sees own, Principal sees all).
 */
async function getContentById(req, res, next) {
  try {
    const teacherId = req.user.role === 'teacher' ? req.user.id : null;
    const content = await contentService.getContentById(
      parseInt(req.params.id, 10),
      teacherId
    );
    return ApiResponse.success(res, content, 'Content retrieved');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/content/all
 * Get all content (Principal only).
 */
async function getAllContent(req, res, next) {
  try {
    const result = await contentService.getAllContent(req.query);
    return ApiResponse.paginated(
      res,
      result.content,
      result.pagination,
      'All content retrieved'
    );
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/content/pending
 * Get all pending content (Principal only).
 */
async function getPendingContent(req, res, next) {
  try {
    const result = await contentService.getPendingContent(req.query);
    return ApiResponse.paginated(
      res,
      result.content,
      result.pagination,
      'Pending content retrieved'
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadContent,
  getMyContent,
  getContentById,
  getAllContent,
  getPendingContent,
};
