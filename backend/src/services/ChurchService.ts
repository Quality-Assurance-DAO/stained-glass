import prisma from '../config/database';
import logger from '../utils/logger';

export interface ChurchSearchParams {
  county?: string;
  town?: string;
  page?: number;
  limit?: number;
}

export interface ChurchSearchResult {
  churches: Array<{
    id: string;
    name: string;
    county: string;
    town: string;
    latitude: number;
    longitude: number;
    floor_plan_url: string | null;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ChurchService {
  /**
   * Search for churches by county and/or town
   */
  async searchChurches(params: ChurchSearchParams): Promise<ChurchSearchResult> {
    const { county, town, page = 1, limit = 20 } = params;

    // Build where clause
    const where: any = {};
    if (county) {
      where.county = {
        contains: county,
        mode: 'insensitive',
      };
    }
    if (town) {
      where.town = {
        contains: town,
        mode: 'insensitive',
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    try {
      // Get total count
      const total = await prisma.church.count({ where });

      // Get churches
      const churches = await prisma.church.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { county: 'asc' },
          { town: 'asc' },
          { name: 'asc' },
        ],
        select: {
          id: true,
          name: true,
          county: true,
          town: true,
          latitude: true,
          longitude: true,
          floor_plan_url: true,
        },
      });

      // Convert Decimal to number for JSON serialization
      const churchesWithNumbers = churches.map((church) => ({
        ...church,
        latitude: Number(church.latitude),
        longitude: Number(church.longitude),
      }));

      const totalPages = Math.ceil(total / limit);

      logger.debug(`Found ${total} churches matching search criteria`, { county, town, page, limit });

      return {
        churches: churchesWithNumbers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('Error searching churches', { error, params });
      throw error;
    }
  }

  /**
   * Get church details by ID
   */
  async getChurchById(churchId: string) {
    try {
      const church = await prisma.church.findUnique({
        where: { id: churchId },
        include: {
          windows: {
            include: {
              _count: {
                select: {
                  submissions: {
                    where: {
                      deleted_at: null,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!church) {
        return null;
      }

      // Convert Decimal to number
      return {
        ...church,
        latitude: Number(church.latitude),
        longitude: Number(church.longitude),
        windows: church.windows.map((window) => ({
          ...window,
          submissionCount: window._count.submissions,
        })),
      };
    } catch (error) {
      logger.error('Error getting church by ID', { error, churchId });
      throw error;
    }
  }
}

export default new ChurchService();



