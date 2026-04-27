// ============================================================
// Content Routes — Upload, view own content (Teacher)
// ============================================================

const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { upload, handleUploadError } = require('../middlewares/upload.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { uploadContentSchema, contentQuerySchema } = require('../validations/content.validation');
const { ROLES } = require('../utils/constants');

/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Content management endpoints
 */

/**
 * @swagger
 * /api/content/upload:
 *   post:
 *     summary: Upload new content (Teacher only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, subject, file]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Maths Chapter 5 Question Paper"
 *               description:
 *                 type: string
 *                 example: "Question paper for algebra chapter"
 *               subject:
 *                 type: string
 *                 enum: [maths, science, english, history, geography, computer_science, physics, chemistry, biology, economics]
 *                 example: "maths"
 *               file:
 *                 type: string
 *                 format: binary
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-27T09:00:00Z"
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-27T17:00:00Z"
 *               rotation_duration:
 *                 type: integer
 *                 example: 5
 *                 description: "Duration in minutes for rotation"
 *     responses:
 *       201:
 *         description: Content uploaded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a teacher
 *       413:
 *         description: File too large
 */
router.post(
  '/upload',
  authenticate,
  authorize(ROLES.TEACHER),
  upload.single('file'),
  handleUploadError,
  validate(uploadContentSchema),
  contentController.uploadContent
);

/**
 * @swagger
 * /api/content/my:
 *   get:
 *     summary: Get content uploaded by the logged-in teacher
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter by subject
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [uploaded, pending, approved, rejected]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Teacher content listed
 *       401:
 *         description: Not authenticated
 */
router.get(
  '/my',
  authenticate,
  authorize(ROLES.TEACHER),
  validate(contentQuerySchema, 'query'),
  contentController.getMyContent
);

/**
 * @swagger
 * /api/content/all:
 *   get:
 *     summary: Get all content (Principal only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [uploaded, pending, approved, rejected]
 *     responses:
 *       200:
 *         description: All content listed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a principal
 */
router.get(
  '/all',
  authenticate,
  authorize(ROLES.PRINCIPAL),
  validate(contentQuerySchema, 'query'),
  contentController.getAllContent
);

/**
 * @swagger
 * /api/content/pending:
 *   get:
 *     summary: Get all pending content (Principal only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pending content listed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a principal
 */
router.get(
  '/pending',
  authenticate,
  authorize(ROLES.PRINCIPAL),
  contentController.getPendingContent
);

/**
 * @swagger
 * /api/content/{id}:
 *   get:
 *     summary: Get single content by ID
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content details
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Content not found
 */
router.get(
  '/:id',
  authenticate,
  authorize(ROLES.TEACHER, ROLES.PRINCIPAL),
  contentController.getContentById
);

module.exports = router;
