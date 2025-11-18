import { Router, Request, Response } from 'express';
import { upload, handleUploadError } from '../middleware/upload';
import { uploadRateLimiter, progressiveDelay } from '../middleware/rateLimit';
import photoSubmissionService from '../../services/PhotoSubmissionService';
import uploadQueueService from '../../services/UploadQueueService';
import logger from '../../utils/logger';

const router = Router();

/**
 * POST /submissions
 * Upload a new photo submission
 */
router.post(
  '/',
  uploadRateLimiter,
  progressiveDelay,
  upload.single('photo'),
  handleUploadError,
  async (req: Request, res: Response) => {
    try {
      // Validate required fields
      const { user_id, church_id, latitude, longitude, location_verified, timestamp } =
        req.body;

      if (!user_id) {
        return res.status(400).json({
          error: 'Missing required field',
          message: 'user_id is required',
        });
      }

      if (!church_id) {
        return res.status(400).json({
          error: 'Missing required field',
          message: 'church_id is required',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: 'Missing required field',
          message: 'photo file is required',
        });
      }

      // Validate location
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({
          error: 'Invalid location',
          message: 'latitude and longitude must be valid numbers',
        });
      }

      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({
          error: 'Invalid location',
          message: 'latitude must be between -90 and 90, longitude between -180 and 180',
        });
      }

      // Parse optional fields
      const locationVerified = location_verified === 'true' || location_verified === true;
      const submissionTimestamp = timestamp ? new Date(timestamp) : new Date();
      const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : undefined;

      // Validate file type
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'Only image files are allowed',
        });
      }

      // Validate file size (already handled by multer, but double-check)
      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          error: 'File too large',
          message: 'Maximum file size is 10MB',
        });
      }

      // Create submission
      const submission = await photoSubmissionService.create({
        userId: user_id,
        churchId: church_id,
        imageBuffer: req.file.buffer,
        latitude: lat,
        longitude: lon,
        locationVerified,
        timestamp: submissionTimestamp,
        metadata,
      });

      // Queue for Arweave upload (async)
      try {
        await uploadQueueService.createQueueEntry({
          submissionId: submission.id,
          queueType: 'arweave',
          payload: {
            imageBuffer: req.file.buffer.toString('base64'),
            metadata: {
              churchId: church_id,
              userId: user_id,
              timestamp: submissionTimestamp.toISOString(),
              latitude: lat,
              longitude: lon,
            },
          },
        });
      } catch (queueError) {
        logger.error('Failed to queue Arweave upload', {
          error: queueError,
          submissionId: submission.id,
        });
        // Don't fail the request if queueing fails
      }

      // Queue for Cardano audit trail (async)
      try {
        await uploadQueueService.createQueueEntry({
          submissionId: submission.id,
          queueType: 'cardano',
          payload: {
            action: 'upload',
            submissionId: submission.id,
            timestamp: submissionTimestamp.toISOString(),
          },
        });
      } catch (queueError) {
        logger.error('Failed to queue Cardano audit trail', {
          error: queueError,
          submissionId: submission.id,
        });
        // Don't fail the request if queueing fails
      }

      logger.info('Photo submission created successfully', {
        submissionId: submission.id,
        userId: user_id,
        churchId: church_id,
      });

      res.status(201).json({
        success: true,
        data: submission,
      });
    } catch (error: any) {
      logger.error('Error creating photo submission', { error, body: req.body });

      // Handle known errors with specific status codes
      if (error.message.includes('does not exist')) {
        return res.status(404).json({
          error: 'Church not found',
          message: 'The specified church does not exist in the database. Please contact admin to add the church first.',
        });
      }

      if (error.message.includes('coordinates') || error.message.includes('valid coordinates')) {
        return res.status(400).json({
          error: 'Invalid church coordinates',
          message: 'Church does not have valid coordinates. Please contact admin to add coordinates first.',
        });
      }

      if (error.message.includes('Location too far')) {
        return res.status(400).json({
          error: 'Location verification failed',
          message: error.message,
        });
      }

      if (error.message.includes('Duplicate submission') || error.message.includes('duplicate')) {
        return res.status(409).json({
          error: 'Duplicate submission',
          message: 'This photo has already been uploaded recently at this location.',
        });
      }

      // Rate limit errors are handled by middleware, but catch any edge cases
      if (error.message.includes('rate limit') || error.message.includes('too many')) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Maximum 10 uploads per hour. Please try again later.',
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create photo submission. Please try again later.',
      });
    }
  }
);

/**
 * GET /submissions/:id
 * Get a single submission by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission = await photoSubmissionService.getSubmissionById(id);

    if (!submission) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Photo submission not found',
      });
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    logger.error('Error getting submission', { error, id: req.params.id });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get photo submission',
    });
  }
});

export default router;

