import { Router, Request, Response } from 'express';
import windowService from '../../services/WindowService';
import logger from '../../utils/logger';

const router = Router();

/**
 * GET /windows/:windowId
 * Get a single window by ID
 */
router.get('/:windowId', async (req: Request, res: Response) => {
  try {
    const { windowId } = req.params;

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(windowId)) {
      return res.status(400).json({
        error: 'Invalid window ID format',
      });
    }

    const window = await windowService.getWindowById(windowId);

    if (!window) {
      return res.status(404).json({
        error: 'Window not found',
      });
    }

    res.json(window);
  } catch (error) {
    logger.error('Error in get window endpoint', { error });
    res.status(500).json({
      error: 'Internal server error while fetching window details',
    });
  }
});

export default router;
