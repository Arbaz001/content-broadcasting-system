// ============================================================
// Approval Service — Principal approval/rejection logic
// ============================================================

const { Content, User, ContentSlot, ContentSchedule } = require('../models');
const ApiError = require('../utils/apiError');
const { CONTENT_STATUS } = require('../utils/constants');
const { invalidateCache } = require('../config/redis');

/**
 * Approve content (Principal action).
 * On approval:
 * - Status changes to 'approved'
 * - approved_by and approved_at are set
 * - A ContentSchedule entry is created for rotation
 * - Cache is invalidated for the teacher's live endpoint
 *
 * @param {number} contentId - ID of content to approve
 * @param {number} principalId - ID of the approving principal
 * @returns {object} - Updated content
 */
async function approveContent(contentId, principalId) {
  // Find the content
  const content = await Content.findByPk(contentId, {
    include: [
      { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] },
    ],
  });

  if (!content) {
    throw ApiError.notFound('Content not found.');
  }

  // Check if already approved (idempotent)
  if (content.status === CONTENT_STATUS.APPROVED) {
    return content;
  }

  // Only pending content can be approved
  if (content.status !== CONTENT_STATUS.PENDING) {
    throw ApiError.badRequest(
      `Cannot approve content with status "${content.status}". Only pending content can be approved.`
    );
  }

  // Update content status
  content.status = CONTENT_STATUS.APPROVED;
  content.approved_by = principalId;
  content.approved_at = new Date();
  content.rejection_reason = null; // Clear any previous rejection
  await content.save();

  // Create schedule entry
  await createScheduleEntry(content);

  // Invalidate cache for the uploading teacher's live feed
  await invalidateCache(`live:${content.uploaded_by}:*`);

  // Return updated content with associations
  const updatedContent = await Content.findByPk(contentId, {
    include: [
      { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'approver', attributes: ['id', 'name'] },
    ],
  });

  return updatedContent;
}

/**
 * Reject content with a reason (Principal action).
 *
 * @param {number} contentId - ID of content to reject
 * @param {number} principalId - ID of the rejecting principal
 * @param {string} rejectionReason - Required reason for rejection
 * @returns {object} - Updated content
 */
async function rejectContent(contentId, principalId, rejectionReason) {
  // Find the content
  const content = await Content.findByPk(contentId);

  if (!content) {
    throw ApiError.notFound('Content not found.');
  }

  // Check if already rejected
  if (content.status === CONTENT_STATUS.REJECTED) {
    throw ApiError.badRequest('Content is already rejected.');
  }

  // Only pending content can be rejected
  if (content.status !== CONTENT_STATUS.PENDING) {
    throw ApiError.badRequest(
      `Cannot reject content with status "${content.status}". Only pending content can be rejected.`
    );
  }

  // Update content status
  content.status = CONTENT_STATUS.REJECTED;
  content.rejection_reason = rejectionReason;
  content.approved_by = principalId; // Track who rejected it
  await content.save();

  // Remove any existing schedule entries
  await ContentSchedule.destroy({ where: { content_id: contentId } });

  // Invalidate cache
  await invalidateCache(`live:${content.uploaded_by}:*`);

  // Return updated content
  const updatedContent = await Content.findByPk(contentId, {
    include: [
      { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] },
    ],
  });

  return updatedContent;
}

/**
 * Create a ContentSchedule entry for approved content.
 * Assigns rotation order based on existing entries for the subject.
 *
 * @param {object} content - Content model instance
 */
async function createScheduleEntry(content) {
  // Find or create the content slot for this subject
  const [slot] = await ContentSlot.findOrCreate({
    where: { subject: content.subject },
    defaults: { subject: content.subject },
  });

  // Determine the next rotation order
  const maxOrder = await ContentSchedule.max('rotation_order', {
    where: { slot_id: slot.id },
  });

  const nextOrder = (maxOrder || 0) + 1;

  // Create schedule entry
  await ContentSchedule.findOrCreate({
    where: { content_id: content.id, slot_id: slot.id },
    defaults: {
      content_id: content.id,
      slot_id: slot.id,
      rotation_order: nextOrder,
      duration: content.rotation_duration || 5,
    },
  });
}

module.exports = {
  approveContent,
  rejectContent,
};
