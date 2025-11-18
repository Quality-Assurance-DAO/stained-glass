import prisma from '../config/database';
import logger from '../utils/logger';
import locationService from './LocationService';
import { calculateImageHash } from '../utils/imageHash';
import churchService from './ChurchService';

export interface PhotoSubmissionFilters {
  windowId?: string;
  churchId?: string;
  userId?: string;
}

export interface CreatePhotoSubmissionParams {
  userId: string;
  churchId: string;
  imageBuffer: Buffer;
  latitude: number;
  longitude: number;
  locationVerified: boolean;
  timestamp: Date;
  metadata?: Record<string, any>;
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

  /**
   * Create a new photo submission with validation
   */
  async create(params: CreatePhotoSubmissionParams) {
    const {
      userId,
      churchId,
      imageBuffer,
      latitude,
      longitude,
      locationVerified,
      timestamp,
      metadata,
    } = params;

    try {
      // Validate church exists
      const church = await churchService.getChurchById(churchId);
      if (!church) {
        throw new Error(`Church with ID ${churchId} does not exist`);
      }

      // Validate church has coordinates
      if (
        !locationService.hasValidCoordinates(
          Number(church.latitude),
          Number(church.longitude)
        )
      ) {
        throw new Error(
          'Church does not have valid coordinates. Please contact admin to add coordinates.'
        );
      }

      // Verify location (unless manually overridden)
      if (!locationVerified) {
        const verification = locationService.verifyLocation(
          latitude,
          longitude,
          Number(church.latitude),
          Number(church.longitude),
          false
        );

        if (!verification.isValid) {
          throw new Error(verification.message);
        }
      }

      // Calculate image hash
      const imageHash = await calculateImageHash(imageBuffer);

      // Check for duplicates (same hash, same window, within 1 hour)
      const oneHourAgo = new Date(timestamp.getTime() - 60 * 60 * 1000);
      const duplicate = await prisma.photoSubmission.findFirst({
        where: {
          image_hash: imageHash,
          timestamp: {
            gte: oneHourAgo,
          },
          deleted_at: null,
        },
      });

      if (duplicate) {
        // Check if it's the same location (within 50m)
        const duplicateLat = Number(duplicate.latitude);
        const duplicateLon = Number(duplicate.longitude);
        const verification = locationService.verifyLocation(
          latitude,
          longitude,
          duplicateLat,
          duplicateLon,
          false
        );

        if (verification.isValid) {
          throw new Error(
            'Duplicate submission detected: same image uploaded recently at the same location'
          );
        }
      }

      // Create or get user
      let user = await prisma.user.findUnique({
        where: { app_id: userId },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            app_id: userId,
            contribution_count: 0,
          },
        });
      }

      // Create photo submission
      const submission = await prisma.photoSubmission.create({
        data: {
          user_id: userId,
          image_hash: imageHash,
          timestamp,
          latitude,
          longitude,
          location_verified: locationVerified,
          metadata: metadata || {},
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

      // Update user contribution count
      await prisma.user.update({
        where: { app_id: userId },
        data: {
          contribution_count: {
            increment: 1,
          },
        },
      });

      logger.info('Photo submission created', {
        submissionId: submission.id,
        userId,
        churchId,
        imageHash,
      });

      // Convert Decimal to number
      return {
        ...submission,
        latitude: Number(submission.latitude),
        longitude: Number(submission.longitude),
      };
    } catch (error: any) {
      logger.error('Error creating photo submission', {
        error,
        userId,
        churchId,
      });
      throw error;
    }
  }
}

export default new PhotoSubmissionService();

