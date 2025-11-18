import { Router, Request, Response } from 'express';
import churchService from '../../services/ChurchService';
import logger from '../../utils/logger';

const router = Router();

/**
 * GET /churches/search
 * Search churches by county and/or town
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { county, town } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Max 100 per page

    // Validate pagination
    if (page < 1) {
      return res.status(400).json({
        error: 'Invalid page number. Page must be >= 1',
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Invalid limit. Limit must be between 1 and 100',
      });
    }

    // At least one search parameter required
    if (!county && !town) {
      return res.status(400).json({
        error: 'At least one search parameter (county or town) is required',
      });
    }

    const result = await churchService.searchChurches({
      county: county as string | undefined,
      town: town as string | undefined,
      page,
      limit,
    });

    res.json(result);
  } catch (error) {
    logger.error('Error in church search endpoint', { error });
    res.status(500).json({
      error: 'Internal server error while searching churches',
    });
  }
});

/**
 * GET /churches/:churchId
 * Get church details by ID
 */
router.get('/:churchId', async (req: Request, res: Response) => {
  try {
    const { churchId } = req.params;

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(churchId)) {
      return res.status(400).json({
        error: 'Invalid church ID format',
      });
    }

    const church = await churchService.getChurchById(churchId);

    if (!church) {
      return res.status(404).json({
        error: 'Church not found',
      });
    }

    res.json(church);
  } catch (error) {
    logger.error('Error in get church endpoint', { error });
    res.status(500).json({
      error: 'Internal server error while fetching church details',
    });
  }
});

export default router;

