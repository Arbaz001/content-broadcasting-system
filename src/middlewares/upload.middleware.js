// ============================================================
// Upload Middleware — Multer configuration for file uploads
// ============================================================

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { ALLOWED_FILE_TYPES, ALLOWED_EXTENSIONS, MAX_FILE_SIZE } = require('../utils/constants');
const ApiError = require('../utils/apiError');

/**
 * Cloudinary storage configuration.
 * Files are uploaded directly to Cloudinary.
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'content-broadcasting',
    allowed_formats: ['jpg', 'png', 'gif', 'pdf', 'mp4'], // Adjust based on requirements
    public_id: (req, file) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path.basename(file.originalname, ext);
      return `${baseName}-${uuidv4()}`;
    },
  },
});

/**
 * File filter — only allow specific file types based on constants.
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
 * Multer upload instance using Cloudinary storage.
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
