import { Router, Request, Response } from 'express';
import { upload, handleUploadError } from '../middleware/upload';
import { uploadRateLimiter, progressiveDelay } from '../middleware/rateLimit';
import { verifyOwnership } from '../middleware/ownership';
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

/**
 * POST /submissions/:id/assign
 * Assign a photo submission to a window
 */
router.post('/:id/assign', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { window_id } = req.body;

    if (!window_id) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'window_id is required',
      });
    }

    const submission = await photoSubmissionService.assignToWindow(id, window_id);

    res.json({
      success: true,
      data: submission,
    });
  } catch (error: any) {
    logger.error('Error assigning submission to window', {
      error,
      submissionId: req.params.id,
      windowId: req.body.window_id,
    });

    // Handle known errors with specific status codes
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Not found',
        message: error.message,
      });
    }

    if (error.message.includes('does not belong') || error.message.includes('belong to')) {
      return res.status(400).json({
        error: 'Invalid assignment',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to assign submission to window',
    });
  }
});

/**
 * GET /submissions/:id/ai-analysis
 * Get AI analysis results for a submission
 */
router.get('/:id/ai-analysis', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission = await photoSubmissionService.getSubmissionById(id);

    if (!submission) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Photo submission not found',
      });
    }

    const aiClassification = submission.ai_classification as any;

    if (!aiClassification) {
      return res.json({
        success: true,
        data: {
          status: 'pending',
          message: 'AI analysis is still in progress',
        },
      });
    }

    if (aiClassification.error) {
      return res.json({
        success: true,
        data: {
          status: 'failed',
          error: aiClassification.error,
          timestamp: aiClassification.timestamp,
        },
      });
    }

    res.json({
      success: true,
      data: {
        status: 'completed',
        classification: aiClassification.classification,
        quality: aiClassification.quality,
        windowIdentification: aiClassification.windowIdentification,
        shouldFilter: aiClassification.shouldFilter,
        filterReason: aiClassification.filterReason,
      },
    });
  } catch (error) {
    logger.error('Error getting AI analysis', { error, id: req.params.id });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get AI analysis results',
    });
  }
});

/**
 * GET /submissions/:id/ai-suggestion
 * Get AI-suggested window assignment for a submission
 */
router.get('/:id/ai-suggestion', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const suggestion = await photoSubmissionService.getAISuggestedWindow(id);

    if (!suggestion) {
      return res.json({
        success: true,
        data: null,
        message: 'No AI suggestion available for this submission',
      });
    }

    res.json({
      success: true,
      data: suggestion,
    });
  } catch (error) {
    logger.error('Error getting AI suggestion', { error, id: req.params.id });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get AI suggestion',
    });
  }
});

/**
 * GET /submissions/manual-assignment/needed
 * Get submissions that need manual window assignment
 * Query params: church_id (optional)
 */
router.get('/manual-assignment/needed', async (req: Request, res: Response) => {
  try {
    const { church_id } = req.query;
    const submissions = await photoSubmissionService.getSubmissionsNeedingManualAssignment(
      church_id as string | undefined
    );

    res.json({
      success: true,
      data: submissions,
      count: submissions.length,
    });
  } catch (error) {
    logger.error('Error getting submissions needing manual assignment', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get submissions needing manual assignment',
    });
  }
});

/**
 * PATCH /submissions/:id
 * Update a photo submission (only editable fields: window_id, metadata)
 * Requires ownership verification
 */
router.patch('/:id', verifyOwnership, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { window_id, metadata } = req.body;

    // Build updates object (only include provided fields)
    const updates: {
      window_id?: string | null;
      metadata?: Record<string, any>;
    } = {};

    if (window_id !== undefined) {
      updates.window_id = window_id === null || window_id === '' ? null : window_id;
    }

    if (metadata !== undefined) {
      // Parse metadata if it's a string
      updates.metadata =
        typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
    }

    // Validate that at least one field is being updated
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'At least one field (window_id or metadata) must be provided',
      });
    }

    // Update submission
    const updatedSubmission = await photoSubmissionService.updateSubmission(id, updates);

    res.json({
      success: true,
      data: updatedSubmission,
      message: 'Submission updated successfully',
    });
  } catch (error: any) {
    logger.error('Error updating submission', {
      error,
      submissionId: req.params.id,
      body: req.body,
    });

    // Handle known errors with specific status codes
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Not found',
        message: error.message,
      });
    }

    if (error.message.includes('deleted')) {
      return res.status(410).json({
        error: 'Gone',
        message: error.message,
      });
    }

    if (
      error.message.includes('does not belong') ||
      error.message.includes('belong to')
    ) {
      return res.status(400).json({
        error: 'Invalid update',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update submission',
    });
  }
});

/**
 * DELETE /submissions/:id
 * Soft delete a photo submission
 * Requires ownership verification
 */
router.delete('/:id', verifyOwnership, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await photoSubmissionService.softDeleteSubmission(id);

    res.json({
      success: true,
      data: result,
      message: 'Submission deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error deleting submission', {
      error,
      submissionId: req.params.id,
    });

    // Handle known errors with specific status codes
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Not found',
        message: error.message,
      });
    }

    if (error.message.includes('already deleted')) {
      return res.status(410).json({
        error: 'Gone',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete submission',
    });
  }
});

export default router;

