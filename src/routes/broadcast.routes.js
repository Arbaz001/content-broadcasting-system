// ============================================================
// Broadcast Routes — Public live content endpoints
// ============================================================

const express = require('express');
const router = express.Router();
const broadcastController = require('../controllers/broadcast.controller');
const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for the public broadcasting API.
 * Prevents abuse: 100 requests per 15 minutes per IP.
 */
const broadcastLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * tags:
 *   name: Broadcasting
 *   description: Public content broadcasting endpoints (no auth required)
 */

/**
 * @swagger
 * /api/content/live/{teacherId}:
 *   get:
 *     summary: Get live content for a specific teacher
 *     description: Public endpoint accessible by students. Returns currently active (approved, within time window, rotation-selected) content for the specified teacher.
 *     tags: [Broadcasting]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Teacher's user ID
 *         example: 2
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *           enum: [maths, science, english, history, geography, computer_science, physics, chemistry, biology, economics]
 *         description: Optional subject filter
 *         example: "maths"
 *     responses:
 *       200:
 *         description: Live content returned (or empty array if none available)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Live content retrieved"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subject:
 *                         type: string
 *                       content:
 *                         type: object
 *                       rotation_info:
 *                         type: object
 *       429:
 *         description: Rate limit exceeded
 */
router.get(
  '/live/:teacherId',
  broadcastLimiter,
  broadcastController.getLiveContent
);

module.exports = router;
