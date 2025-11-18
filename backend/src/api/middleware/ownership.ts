import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import logger from '../../utils/logger';

/**
 * Middleware to verify that the user owns the submission they're trying to modify
 * Expects app ID in req.headers['x-app-id'] or req.body.user_id
 * Expects submission ID in req.params.id or req.params.submissionId
 */
export async function verifyOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appId = req.headers['x-app-id'] || req.body.user_id;
    const submissionId = req.params.id || req.params.submissionId;

    if (!appId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'App ID is required. Please provide x-app-id header or user_id in body.',
      });
    }

    if (!submissionId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Submission ID is required',
      });
    }

    // Check if submission exists and belongs to user
    const submission = await prisma.photoSubmission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        user_id: true,
        deleted_at: true,
      },
    });

    if (!submission) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Photo submission not found',
      });
    }

    if (submission.deleted_at) {
      return res.status(410).json({
        error: 'Gone',
        message: 'This submission has been deleted',
      });
    }

    if (submission.user_id !== appId) {
      logger.warn('Ownership verification failed', {
        appId,
        submissionId,
        actualUserId: submission.user_id,
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to modify this submission',
      });
    }

    // Attach submission to request for use in route handlers
    (req as any).submission = submission;
    next();
  } catch (error) {
    logger.error('Error verifying ownership', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify ownership',
    });
  }
}

