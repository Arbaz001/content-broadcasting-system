// ============================================================
// Broadcast Controller — Handle public broadcasting requests
// ============================================================

const broadcastService = require('../services/broadcast.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /api/content/live/:teacherId
 * Public endpoint — returns live content for a teacher.
 * No authentication required.
 */
async function getLiveContent(req, res, next) {
  try {
    const teacherId = parseInt(req.params.teacherId, 10);

    // If teacherId is not a valid number, return empty
    if (isNaN(teacherId)) {
      return ApiResponse.success(res, [], 'No content available');
    }

    const subjectFilter = req.query.subject || null;
    const result = await broadcastService.getLiveContent(teacherId, subjectFilter);

    return ApiResponse.success(res, result.data, result.message);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLiveContent,
};
