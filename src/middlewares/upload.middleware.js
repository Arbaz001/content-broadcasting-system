// ============================================================
// Upload Middleware — Multer configuration for file uploads
// ============================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { ALLOWED_FILE_TYPES, ALLOWED_EXTENSIONS, MAX_FILE_SIZE } = require('../utils/constants');
const ApiError = require('../utils/apiError');

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), process.env.UPLOAD_PATH || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Multer disk storage configuration.
 * Files are stored in the uploads/ directory with UUID-based filenames
 * to prevent collisions.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * File filter — only allow JPG, PNG, and GIF files.
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_FILE_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new ApiError(
        400,
        `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed.`
      ),
      false
    );
  }

  cb(null, true);
};

/**
 * Multer upload instance.
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE, // 10MB default
  },
});

/**
 * Middleware to handle multer errors gracefully.
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(ApiError.tooLarge(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(ApiError.badRequest('Unexpected field name. Use "file" as the field name.'));
    }
    return next(ApiError.badRequest(`Upload error: ${err.message}`));
  }

  if (err instanceof ApiError) {
    return next(err);
  }

  if (err) {
    return next(ApiError.internal('File upload failed.'));
  }

  next();
};

module.exports = {
  upload,
  handleUploadError,
};
