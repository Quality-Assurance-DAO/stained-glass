import prisma from '../config/database';
import logger from '../utils/logger';

export interface PhotoSubmissionFilters {
  windowId?: string;
  churchId?: string;
  userId?: string;
}

export class PhotoSubmissionService {
  /**
   * Get photo submissions with optional filters
   */
  async getSubmissions(filters: PhotoSubmissionFilters = {}) {
    try {
      const where: any = {
        deleted_at: null,
      };

      if (filters.windowId) {
        where.window_id = filters.windowId;
      }

      if (filters.churchId) {
        where.window = {
          church_id: filters.churchId,
        };
      }

      if (filters.userId) {
        where.user_id = filters.userId;
      }

      const submissions = await prisma.photoSubmission.findMany({
        where,
        include: {
          window: {
            select: {
              id: true,
              location_description: true,
              church: {
                select: {
                  id: true,
                  name: true,
                  county: true,
                  town: true,
                },
              },
            },
          },
          user: {
            select: {
              app_id: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      // Convert Decimal to number
      return submissions.map((submission) => ({
        ...submission,
        latitude: Number(submission.latitude),
        longitude: Number(submission.longitude),
      }));
    } catch (error) {
      logger.error('Error getting photo submissions', { error, filters });
      throw error;
    }
  }

  /**
   * Get submissions for a specific window
   */
  async getSubmissionsByWindowId(windowId: string) {
    return this.getSubmissions({ windowId });
  }

  /**
   * Get submissions for a specific church
   */
  async getSubmissionsByChurchId(churchId: string) {
    return this.getSubmissions({ churchId });
  }

  /**
   * Get a single submission by ID
   */
  async getSubmissionById(submissionId: string) {
    try {
      const submission = await prisma.photoSubmission.findFirst({
        where: {
          id: submissionId,
          deleted_at: null,
        },
        include: {
          window: {
            include: {
              church: {
                select: {
                  id: true,
                  name: true,
                  county: true,
                  town: true,
                  floor_plan_url: true,
                },
              },
            },
          },
          user: {
            select: {
              app_id: true,
            },
          },
        },
      });

      if (!submission) {
        return null;
      }

      // Convert Decimal to number
      return {
        ...submission,
        latitude: Number(submission.latitude),
        longitude: Number(submission.longitude),
      };
    } catch (error) {
      logger.error('Error getting submission by ID', { error, submissionId });
      throw error;
    }
  }
}

export default new PhotoSubmissionService();

