// ============================================================
// Approval Routes — Approve / Reject content (Principal)
// ============================================================

const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approval.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { rejectContentSchema } = require('../validations/approval.validation');
const { ROLES } = require('../utils/constants');

/**
 * @swagger
 * tags:
 *   name: Approval
 *   description: Content approval/rejection endpoints (Principal only)
 */

/**
 * @swagger
 * /api/content/{id}/approve:
 *   patch:
 *     summary: Approve content (Principal only)
 *     tags: [Approval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Content ID to approve
 *     responses:
 *       200:
 *         description: Content approved
 *       400:
 *         description: Content not in pending status
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a principal
 *       404:
 *         description: Content not found
 */
router.patch(
  '/:id/approve',
  authenticate,
  authorize(ROLES.PRINCIPAL),
  approvalController.approveContent
);

/**
 * @swagger
 * /api/content/{id}/reject:
 *   patch:
 *     summary: Reject content with reason (Principal only)
 *     tags: [Approval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Content ID to reject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rejection_reason]
 *             properties:
 *               rejection_reason:
 *                 type: string
 *                 minLength: 5
 *                 example: "Content quality is too low. Please re-upload with higher resolution."
 *     responses:
 *       200:
 *         description: Content rejected
 *       400:
 *         description: Validation error or content not in pending status
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a principal
 *       404:
 *         description: Content not found
 */
router.patch(
  '/:id/reject',
  authenticate,
  authorize(ROLES.PRINCIPAL),
  validate(rejectContentSchema),
  approvalController.rejectContent
);

module.exports = router;
