// ============================================================
// Approval Controller — Handle approval/rejection requests
// ============================================================

const approvalService = require('../services/approval.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * PATCH /api/content/:id/approve
 * Approve content (Principal only).
 */
async function approveContent(req, res, next) {
  try {
    const content = await approvalService.approveContent(
      parseInt(req.params.id, 10),
      req.user.id
    );
    return ApiResponse.success(res, content, 'Content approved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/content/:id/reject
 * Reject content with reason (Principal only).
 */
async function rejectContent(req, res, next) {
  try {
    const content = await approvalService.rejectContent(
      parseInt(req.params.id, 10),
      req.user.id,
      req.body.rejection_reason
    );
    return ApiResponse.success(res, content, 'Content rejected');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  approveContent,
  rejectContent,
};
