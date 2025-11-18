import { Router, Request, Response } from 'express';
import userService from '../../services/UserService';
import photoSubmissionService from '../../services/PhotoSubmissionService';
import logger from '../../utils/logger';

const router = Router();

/**
 * GET /users/:appId
 * Get user profile by app ID (creates user if doesn't exist)
 */
router.get('/:appId', async (req: Request, res: Response) => {
  try {
    const { appId } = req.params;

    if (!appId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'App ID is required',
      });
    }

    // Get or create user (auto-creates if first time)
    const profile = await userService.getOrCreate(appId);

    // Get contribution stats
    const stats = await userService.getContributionStats(appId);

    res.json({
      success: true,
      data: {
        ...profile,
        stats,
      },
    });
  } catch (error: any) {
    logger.error('Error getting user profile', { error, appId: req.params.appId });
    
    // Handle invalid app ID format
    if (error.message && error.message.includes('Invalid app ID')) {
      return res.status(400).json({
        error: 'Bad request',
        message: error.message,
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user profile',
    });
  }
});

/**
 * GET /users/:appId/submissions
 * Get all submissions for a user
 * Query params: page, limit
 */
router.get('/:appId/submissions', async (req: Request, res: Response) => {
  try {
    const { appId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    if (!appId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'App ID is required',
      });
    }

    // Get or create user (auto-creates if doesn't exist)
    const user = await userService.getOrCreate(appId);

    // Get submissions
    const submissions = await photoSubmissionService.getSubmissions({
      userId: appId,
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubmissions = submissions.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        data: paginatedSubmissions,
        pagination: {
          page,
          limit,
          total: submissions.length,
          totalPages: Math.ceil(submissions.length / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting user submissions', {
      error,
      appId: req.params.appId,
    });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user submissions',
    });
  }
});

export default router;

