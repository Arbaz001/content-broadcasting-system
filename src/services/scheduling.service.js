// ============================================================
// Scheduling Service — Core rotation and time-window logic
// ============================================================
// This is the MOST IMPORTANT business logic module.
// It determines which content is currently active for a given
// teacher based on subject-based rotation and time windows.
// ============================================================

const { Op } = require('sequelize');
const { Content, ContentSlot, ContentSchedule, User } = require('../models');
const { CONTENT_STATUS } = require('../utils/constants');

/**
 * Get currently active content for a specific teacher.
 * Applies:
 *   1. Status filter: only approved content
 *   2. Time window filter: current time within [start_time, end_time]
 *   3. Subject-based rotation: determines which content is active per subject
 *
 * @param {number} teacherId - Teacher's user ID
 * @param {string|null} subjectFilter - Optional subject to filter by
 * @returns {object} - { activeContent: [...], teacher: {...} }
 */
async function getActiveContent(teacherId, subjectFilter = null) {
  const now = new Date();

  // 1. Build query for approved, time-windowed content by this teacher
  const where = {
    uploaded_by: teacherId,
    status: CONTENT_STATUS.APPROVED,
    // Content must have both start_time and end_time set
    start_time: {
      [Op.not]: null,
      [Op.lte]: now,
    },
    end_time: {
      [Op.not]: null,
      [Op.gte]: now,
    },
  };

  // Apply optional subject filter
  if (subjectFilter) {
    where.subject = subjectFilter;
  }

  // 2. Fetch all eligible content with schedule info
  const eligibleContent = await Content.findAll({
    where,
    include: [
      {
        model: ContentSchedule,
        as: 'schedules',
        include: [
          {
            model: ContentSlot,
            as: 'slot',
          },
        ],
      },
      {
        model: User,
        as: 'uploader',
        attributes: ['id', 'name'],
      },
    ],
    order: [['subject', 'ASC'], ['created_at', 'ASC']],
  });

  // 3. If no eligible content, return empty
  if (eligibleContent.length === 0) {
    return {
      activeContent: [],
      message: 'No content available',
    };
  }

  // 4. Group content by subject
  const contentBySubject = {};
  for (const item of eligibleContent) {
    if (!contentBySubject[item.subject]) {
      contentBySubject[item.subject] = [];
    }
    contentBySubject[item.subject].push(item);
  }

  // 5. For each subject, determine active content via rotation
  const activeContent = [];

  for (const [subject, items] of Object.entries(contentBySubject)) {
    const active = determineActiveByRotation(items, now);
    if (active) {
      activeContent.push({
        subject,
        content: formatContentResponse(active.content),
        rotation_info: {
          total_items_in_rotation: items.length,
          current_position: active.position + 1,
          duration_minutes: active.content.rotation_duration,
          next_rotation_at: active.nextRotationAt,
        },
      });
    }
  }

  return {
    activeContent,
    message: activeContent.length > 0 ? 'Live content retrieved' : 'No content available',
  };
}

/**
 * CORE ROTATION ALGORITHM
 *
 * Determines which content item is currently active within a subject group
 * based on time-based rotation.
 *
 * Algorithm:
 *   1. Sort items by rotation_order (from ContentSchedule) or by ID as fallback
 *   2. Calculate total cycle duration (sum of all rotation_durations)
 *   3. Find a reference start time (earliest start_time among items)
 *   4. Calculate elapsed time since reference start
 *   5. Find position within current cycle using modulo
 *   6. Walk through items accumulating durations to find active item
 *
 * @param {Array} items - Array of Content model instances (all same subject)
 * @param {Date} now - Current time
 * @returns {object|null} - { content, position, nextRotationAt }
 */
function determineActiveByRotation(items, now) {
  if (!items || items.length === 0) return null;

  // Single item — always active
  if (items.length === 1) {
    return {
      content: items[0],
      position: 0,
      nextRotationAt: null, // No rotation needed
    };
  }

  // Sort by rotation_order (or content ID as fallback)
  const sorted = [...items].sort((a, b) => {
    const orderA = a.schedules?.[0]?.rotation_order ?? a.id;
    const orderB = b.schedules?.[0]?.rotation_order ?? b.id;
    return orderA - orderB;
  });

  // Calculate total cycle duration in milliseconds
  const totalCycleMs = sorted.reduce((sum, item) => {
    return sum + (item.rotation_duration || 5) * 60 * 1000;
  }, 0);

  // Reference start time: earliest start_time among all items
  const referenceStart = sorted.reduce((earliest, item) => {
    const st = new Date(item.start_time);
    return st < earliest ? st : earliest;
  }, new Date(sorted[0].start_time));

  // Elapsed time since reference start in milliseconds
  const elapsedMs = now.getTime() - referenceStart.getTime();

  // If somehow we're before the reference start, show the first item
  if (elapsedMs < 0) {
    return {
      content: sorted[0],
      position: 0,
      nextRotationAt: new Date(referenceStart.getTime() + sorted[0].rotation_duration * 60 * 1000),
    };
  }

  // Position within the current cycle
  const positionInCycleMs = elapsedMs % totalCycleMs;

  // Walk through items to find which one is active
  let accumulatedMs = 0;
  for (let i = 0; i < sorted.length; i++) {
    const durationMs = (sorted[i].rotation_duration || 5) * 60 * 1000;
    accumulatedMs += durationMs;

    if (positionInCycleMs < accumulatedMs) {
      // This item is currently active
      const timeRemainingMs = accumulatedMs - positionInCycleMs;
      return {
        content: sorted[i],
        position: i,
        nextRotationAt: new Date(now.getTime() + timeRemainingMs),
      };
    }
  }

  // Fallback to first item (should not reach here)
  return {
    content: sorted[0],
    position: 0,
    nextRotationAt: null,
  };
}

/**
 * Format content for public API response.
 * Strips internal/sensitive fields.
 *
 * @param {object} content - Content model instance
 * @returns {object} - Sanitized content object
 */
function formatContentResponse(content) {
  return {
    id: content.id,
    title: content.title,
    description: content.description,
    subject: content.subject,
    file_url: content.file_url,
    file_type: content.file_type,
    start_time: content.start_time,
    end_time: content.end_time,
    rotation_duration: content.rotation_duration,
    uploaded_by: content.uploader
      ? { id: content.uploader.id, name: content.uploader.name }
      : content.uploaded_by,
    created_at: content.created_at,
  };
}

module.exports = {
  getActiveContent,
  determineActiveByRotation,
};
