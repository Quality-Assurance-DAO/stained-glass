import prisma from '../config/database';
import logger from '../utils/logger';
import locationService from './LocationService';
import { calculateImageHash } from '../utils/imageHash';
import churchService from './ChurchService';
import { processAIAnalysis } from '../jobs/aiAnalysisProcessor';
import aiService from './AIService';
import userService from './UserService';

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

      // Update user contribution stats (async, don't wait)
      userService.updateContributionStats(userId).catch((error) => {
        logger.error('Failed to update user contribution stats', { error, userId });
      });

      logger.info('Photo submission created', {
        submissionId: submission.id,
        userId,
        churchId,
        imageHash,
      });

      // Trigger AI analysis asynchronously (don't wait for it)
      processAIAnalysis({
        submissionId: submission.id,
        imageBuffer,
        imageHash,
        churchId,
      }).catch((error) => {
        logger.error('Failed to trigger AI analysis', {
          error,
          submissionId: submission.id,
        });
        // Don't throw - submission is already created
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

  /**
   * Assign a photo submission to a window
   */
  async assignToWindow(submissionId: string, windowId: string) {
    try {
      // Get the submission
      const submission = await prisma.photoSubmission.findFirst({
        where: {
          id: submissionId,
          deleted_at: null,
        },
        include: {
          window: {
            include: {
              church: true,
            },
          },
        },
      });

      if (!submission) {
        throw new Error(`Photo submission with ID ${submissionId} not found`);
      }

      // Get the window and verify it exists
      const window = await prisma.window.findUnique({
        where: { id: windowId },
        include: {
          church: true,
        },
      });

      if (!window) {
        throw new Error(`Window with ID ${windowId} not found`);
      }

      // Validate that the window belongs to the correct church
      // If submission already has a window assigned, verify the new window belongs to the same church
      if (submission.window_id && submission.window) {
        const existingChurchId = submission.window.church_id;
        if (window.church_id !== existingChurchId) {
          throw new Error(
            `Window ${windowId} does not belong to the same church as the submission's current window`
          );
        }
      } else {
        // If submission doesn't have a window yet, find the church by matching location
        // Find churches within 50m of the submission location
        const submissionLat = Number(submission.latitude);
        const submissionLon = Number(submission.longitude);
        
        const nearbyChurches = await prisma.church.findMany({
          where: {
            latitude: {
              gte: submissionLat - 0.0005, // ~50m latitude
              lte: submissionLat + 0.0005,
            },
            longitude: {
              gte: submissionLon - 0.0005, // ~50m longitude
              lte: submissionLon + 0.0005,
            },
          },
        });

        // Verify location matches using haversine distance
        const matchingChurch = nearbyChurches.find((church) => {
          const distance = locationService.verifyLocation(
            submissionLat,
            submissionLon,
            Number(church.latitude),
            Number(church.longitude),
            false
          );
          return distance.isValid;
        });

        if (!matchingChurch) {
          throw new Error(
            `Cannot determine church for submission. No church found within 50m of submission location.`
          );
        }

        // Verify the window belongs to the matching church
        if (window.church_id !== matchingChurch.id) {
          throw new Error(
            `Window ${windowId} does not belong to the church at this location (${matchingChurch.name})`
          );
        }
      }
      
      // Update the submission
      const updatedSubmission = await prisma.photoSubmission.update({
        where: { id: submissionId },
        data: {
          window_id: windowId,
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

      logger.info('Photo submission assigned to window', {
        submissionId,
        windowId,
        churchId: window.church_id,
      });

      // Convert Decimal to number
      return {
        ...updatedSubmission,
        latitude: Number(updatedSubmission.latitude),
        longitude: Number(updatedSubmission.longitude),
      };
    } catch (error: any) {
      logger.error('Error assigning submission to window', {
        error,
        submissionId,
        windowId,
      });
      throw error;
    }
  }

  /**
   * Get primary photo for a window (best quality photo)
   * Uses AI quality scores if available, falls back to other heuristics
   */
  async getPrimaryPhotoForWindow(windowId: string) {
    try {
      const submissions = await this.getSubmissionsByWindowId(windowId);

      if (submissions.length === 0) {
        return null;
      }

      // Filter out deleted submissions
      const validSubmissions = submissions.filter((s) => !s.deleted_at);

      if (validSubmissions.length === 0) {
        return null;
      }

      // Find submission with highest AI quality score
      let primarySubmission = validSubmissions[0];
      let highestScore = 0;

      for (const submission of validSubmissions) {
        const aiClassification = submission.ai_classification as any;
        if (aiClassification?.quality?.score) {
          const score = aiClassification.quality.score;
          if (score > highestScore) {
            highestScore = score;
            primarySubmission = submission;
          }
        }
      }

      // If no AI scores available, use first submission (or could use other heuristics)
      return primarySubmission;
    } catch (error: any) {
      logger.error('Error getting primary photo for window', { error, windowId });
      throw error;
    }
  }

  /**
   * Get filtered submissions (exclude low-quality/irrelevant ones)
   */
  async getFilteredSubmissions(filters: PhotoSubmissionFilters = {}) {
    try {
      const allSubmissions = await this.getSubmissions(filters);

      // Filter out submissions that AI marked as should be filtered
      return allSubmissions.filter((submission) => {
        const aiClassification = submission.ai_classification as any;
        if (aiClassification?.shouldFilter === true) {
          return false;
        }
        return true;
      });
    } catch (error: any) {
      logger.error('Error getting filtered submissions', { error, filters });
      throw error;
    }
  }

  /**
   * Get submissions flagged for manual assignment (AI failed or uncertain)
   */
  async getSubmissionsNeedingManualAssignment(churchId?: string) {
    try {
      const filters: PhotoSubmissionFilters = churchId ? { churchId } : {};
      const allSubmissions = await this.getSubmissions(filters);

      return allSubmissions.filter((submission) => {
        // No window assigned
        if (!submission.window_id) {
          return true;
        }

        // AI analysis failed or missing
        const aiClassification = submission.ai_classification as any;
        if (!aiClassification || aiClassification.error) {
          return true;
        }

        // AI suggested a window but confidence is low
        if (
          aiClassification.windowIdentification?.suggestedWindowId &&
          aiClassification.windowIdentification.confidence < 0.8
        ) {
          return true;
        }

        return false;
      });
    } catch (error: any) {
      logger.error('Error getting submissions needing manual assignment', {
        error,
        churchId,
      });
      throw error;
    }
  }

  /**
   * Get AI-suggested window assignment for a submission
   */
  async getAISuggestedWindow(submissionId: string) {
    try {
      const submission = await this.getSubmissionById(submissionId);
      if (!submission) {
        return null;
      }

      const aiClassification = submission.ai_classification as any;
      if (!aiClassification?.windowIdentification) {
        return null;
      }

      return {
        windowId: aiClassification.windowIdentification.suggestedWindowId,
        confidence: aiClassification.windowIdentification.confidence,
        reasoning: aiClassification.windowIdentification.reasoning,
        locationDescription:
          aiClassification.windowIdentification.locationDescription,
      };
    } catch (error: any) {
      logger.error('Error getting AI suggested window', { error, submissionId });
      throw error;
    }
  }

  /**
   * Check if submission needs manual review (filtered or low quality)
   */
  async needsManualReview(submissionId: string): Promise<boolean> {
    try {
      const submission = await this.getSubmissionById(submissionId);
      if (!submission) {
        return false;
      }

      const aiClassification = submission.ai_classification as any;
      if (!aiClassification) {
        return false; // No AI analysis yet
      }

      // Needs review if filtered or low quality
      if (aiClassification.shouldFilter === true) {
        return true;
      }

      if (aiClassification.quality?.score && aiClassification.quality.score < 50) {
        return true;
      }

      return false;
    } catch (error: any) {
      logger.error('Error checking if submission needs manual review', {
        error,
        submissionId,
      });
      return false;
    }
  }

  /**
   * Update a photo submission (only editable fields: window_id, metadata)
   * Immutable fields: image, location, timestamp, blockchain references, user_id
   */
  async updateSubmission(
    submissionId: string,
    updates: {
      window_id?: string | null;
      metadata?: Record<string, any>;
    }
  ) {
    try {
      // Get existing submission
      const existingSubmission = await prisma.photoSubmission.findUnique({
        where: { id: submissionId },
        select: {
          id: true,
          user_id: true,
          window_id: true,
          metadata: true,
          deleted_at: true,
        },
      });

      if (!existingSubmission) {
        throw new Error('Photo submission not found');
      }

      if (existingSubmission.deleted_at) {
        throw new Error('Cannot update a deleted submission');
      }

      // Build update data (only editable fields)
      const updateData: any = {};

      if (updates.window_id !== undefined) {
        // If window_id is provided, validate it
        if (updates.window_id !== null) {
          const window = await prisma.window.findUnique({
            where: { id: updates.window_id },
            include: {
              church: true,
            },
          });

          if (!window) {
            throw new Error(`Window ${updates.window_id} not found`);
          }

          // Verify window belongs to the same church as the submission
          const submission = await prisma.photoSubmission.findUnique({
            where: { id: submissionId },
            include: {
              window: {
                include: {
                  church: true,
                },
              },
            },
          });

          if (submission?.window?.church_id !== window.church_id) {
            throw new Error(
              `Window ${updates.window_id} does not belong to the same church as this submission`
            );
          }
        }
        updateData.window_id = updates.window_id;
      }

      if (updates.metadata !== undefined) {
        // Merge with existing metadata
        const existingMetadata = (existingSubmission.metadata as Record<string, any>) || {};
        updateData.metadata = {
          ...existingMetadata,
          ...updates.metadata,
        };
      }

      // Update submission
      const updatedSubmission = await prisma.photoSubmission.update({
        where: { id: submissionId },
        data: updateData,
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

      logger.info('Photo submission updated', {
        submissionId,
        updates,
        userId: existingSubmission.user_id,
      });

      // Create audit trail entry for edit (queue for Cardano)
      try {
        await prisma.auditTrail.create({
          data: {
            submission_id: submissionId,
            action: 'edit',
            metadata: {
              updated_fields: Object.keys(updateData),
              previous_values: {
                window_id: existingSubmission.window_id,
                metadata: existingSubmission.metadata,
              },
              new_values: {
                window_id: updateData.window_id,
                metadata: updateData.metadata,
              },
            },
          },
        });
      } catch (auditError) {
        logger.error('Failed to create audit trail entry for edit', {
          error: auditError,
          submissionId,
        });
        // Don't fail the update if audit trail fails
      }

      // Update user contribution stats (async)
      userService.updateContributionStats(existingSubmission.user_id).catch((error) => {
        logger.error('Failed to update user contribution stats after edit', {
          error,
          userId: existingSubmission.user_id,
        });
      });

      // Convert Decimal to number
      return {
        ...updatedSubmission,
        latitude: Number(updatedSubmission.latitude),
        longitude: Number(updatedSubmission.longitude),
      };
    } catch (error: any) {
      logger.error('Error updating photo submission', {
        error,
        submissionId,
        updates,
      });
      throw error;
    }
  }

  /**
   * Soft delete a photo submission
   * Marks as deleted but preserves blockchain records
   */
  async softDeleteSubmission(submissionId: string) {
    try {
      const submission = await prisma.photoSubmission.findUnique({
        where: { id: submissionId },
        select: {
          id: true,
          user_id: true,
          deleted_at: true,
        },
      });

      if (!submission) {
        throw new Error('Photo submission not found');
      }

      if (submission.deleted_at) {
        throw new Error('Submission is already deleted');
      }

      // Soft delete
      await prisma.photoSubmission.update({
        where: { id: submissionId },
        data: {
          deleted_at: new Date(),
        },
      });

      logger.info('Photo submission soft deleted', {
        submissionId,
        userId: submission.user_id,
      });

      // Create audit trail entry for delete (queue for Cardano)
      try {
        await prisma.auditTrail.create({
          data: {
            submission_id: submissionId,
            action: 'delete',
            metadata: {
              deleted_at: new Date().toISOString(),
            },
          },
        });
      } catch (auditError) {
        logger.error('Failed to create audit trail entry for delete', {
          error: auditError,
          submissionId,
        });
        // Don't fail the delete if audit trail fails
      }

      // Update user contribution stats (async)
      userService.updateContributionStats(submission.user_id).catch((error) => {
        logger.error('Failed to update user contribution stats after delete', {
          error,
          userId: submission.user_id,
        });
      });

      return { success: true, message: 'Submission deleted successfully' };
    } catch (error: any) {
      logger.error('Error soft deleting photo submission', {
        error,
        submissionId,
      });
      throw error;
    }
  }
}

export default new PhotoSubmissionService();

