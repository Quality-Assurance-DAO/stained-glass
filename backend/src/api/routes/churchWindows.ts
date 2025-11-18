import { Router, Request, Response } from 'express';
import windowService from '../../services/WindowService';
import logger from '../../utils/logger';

const router = Router();

/**
 * GET /churches/:churchId/windows
 * Get all windows for a church with their photo submissions
 */
router.get('/churches/:churchId/windows', async (req: Request, res: Response) => {
  try {
    const { churchId } = req.params;

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(churchId)) {
      return res.status(400).json({
        error: 'Invalid church ID format',
      });
    }

    const windows = await windowService.getWindowsByChurchId(churchId);

    res.json({
      windows,
    });
  } catch (error) {
    logger.error('Error in get church windows endpoint', { error });
    res.status(500).json({
      error: 'Internal server error while fetching church windows',
    });
  }
});

export default router;

