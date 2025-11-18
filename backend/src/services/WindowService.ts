import prisma from '../config/database';
import logger from '../utils/logger';

export interface WindowWithSubmissions {
  id: string;
  church_id: string;
  location_description: string | null;
  coordinates_on_plan: any;
  submissions: Array<{
    id: string;
    image_hash: string;
    timestamp: Date;
    latitude: number;
    longitude: number;
    location_verified: boolean;
    arweave_tx_id: string | null;
    cardano_tx_id: string | null;
    metadata: any;
  }>;
}

export class WindowService {
  /**
   * Get all windows for a church with their photo submissions
   */
  async getWindowsByChurchId(churchId: string): Promise<WindowWithSubmissions[]> {
    try {
      const windows = await prisma.window.findMany({
        where: {
          church_id: churchId,
        },
        include: {
          submissions: {
            where: {
              deleted_at: null,
            },
            orderBy: {
              timestamp: 'desc',
            },
            select: {
              id: true,
              image_hash: true,
              timestamp: true,
              latitude: true,
              longitude: true,
              location_verified: true,
              arweave_tx_id: true,
              cardano_tx_id: true,
              metadata: true,
            },
          },
        },
        orderBy: {
          created_at: 'asc',
        },
      });

      // Convert Decimal to number for JSON serialization
      return windows.map((window) => ({
        ...window,
        submissions: window.submissions.map((submission) => ({
          ...submission,
          latitude: Number(submission.latitude),
          longitude: Number(submission.longitude),
        })),
      }));
    } catch (error) {
      logger.error('Error getting windows by church ID', { error, churchId });
      throw error;
    }
  }

  /**
   * Get a single window by ID
   */
  async getWindowById(windowId: string) {
    try {
      const window = await prisma.window.findUnique({
        where: { id: windowId },
        include: {
          church: {
            select: {
              id: true,
              name: true,
              county: true,
              town: true,
            },
          },
          submissions: {
            where: {
              deleted_at: null,
            },
            orderBy: {
              timestamp: 'desc',
            },
          },
        },
      });

      if (!window) {
        return null;
      }

      // Convert Decimal to number
      return {
        ...window,
        submissions: window.submissions.map((submission) => ({
          ...submission,
          latitude: Number(submission.latitude),
          longitude: Number(submission.longitude),
        })),
      };
    } catch (error) {
      logger.error('Error getting window by ID', { error, windowId });
      throw error;
    }
  }
}

export default new WindowService();

