// ============================================================
// Broadcast Service — Public broadcasting orchestration
// ============================================================

const { User } = require('../models');
const schedulingService = require('./scheduling.service');
const { getCache, setCache } = require('../config/redis');
const { ROLES } = require('../utils/constants');

/**
 * Get live broadcast content for a specific teacher.
 * This is the public-facing API that students access.
 *
 * Flow:
 *   1. Check Redis cache
 *   2. Validate that the teacher exists
 *   3. Delegate to scheduling service for rotation logic
 *   4. Cache the result
 *   5. Return formatted response
 *
 * @param {number} teacherId - Teacher's user ID
 * @param {string|null} subjectFilter - Optional subject filter
 * @returns {object} - Live broadcast data
 */
async function getLiveContent(teacherId, subjectFilter = null) {
  // 1. Try cache first (short TTL for rotation accuracy)
  const cacheKey = `live:${teacherId}:${subjectFilter || 'all'}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Validate teacher exists and is actually a teacher
  const teacher = await User.findOne({
    where: { id: teacherId, role: ROLES.TEACHER },
    attributes: ['id', 'name', 'email'],
  });

  if (!teacher) {
    // Return empty response (not error) for invalid teacher
    return {
      teacher: null,
      message: 'No content available',
      data: [],
    };
  }

  // 3. Get active content via scheduling service
  const result = await schedulingService.getActiveContent(teacherId, subjectFilter);

  // 4. Build response
  const response = {
    teacher: {
      id: teacher.id,
      name: teacher.name,
    },
    message: result.message,
    data: result.activeContent || [],
  };

  // 5. Cache for 30 seconds (short to respect rotation timing)
  await setCache(cacheKey, response, 30);

  return response;
}

module.exports = {
  getLiveContent,
};
