import multer from 'multer';
import { Request } from 'express';
import logger from '../../utils/logger';

// Configure multer for memory storage (we'll process the file and hash it)
const storage = multer.memoryStorage();

// File filter to only accept image files
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Middleware to handle upload errors
export const handleUploadError = (
  err: Error,
  req: Request,
  res: any,
  next: any
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      logger.warn('File upload rejected: file too large', { error: err });
      return res.status(400).json({
        error: 'File too large',
        message: 'Maximum file size is 10MB',
      });
    }
    logger.error('Multer error', { error: err });
    return res.status(400).json({
      error: 'Upload error',
      message: err.message,
    });
  }

  if (err.message === 'Only image files are allowed') {
    logger.warn('File upload rejected: invalid file type', { error: err });
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only image files are allowed',
    });
  }

  next(err);
};

