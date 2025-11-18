import prisma from '../config/database';
import logger from '../utils/logger';

export interface UserProfile {
  app_id: string;
  contribution_count: number;
  quality_score: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserContributionStats {
  total_submissions: number;
  average_quality_score: number | null;
}

export class UserService {
  /**
   * Get or create a user by app ID
   * Validates app ID uniqueness server-side
   */
  async getOrCreate(appId: string): Promise<UserProfile> {
    try {
      // Validate app ID format (should be UUID)
      if (!this.isValidAppId(appId)) {
        throw new Error('Invalid app ID format');
      }

      // Try to find existing user
      let user = await prisma.user.findUnique({
        where: { app_id: appId },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            app_id: appId,
            contribution_count: 0,
          },
        });
        logger.info('New user created', { app_id: appId });
      }

      return {
        app_id: user.app_id,
        contribution_count: user.contribution_count,
        quality_score: user.quality_score ? Number(user.quality_score) : null,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    } catch (error) {
      logger.error('Error getting or creating user', { error, appId });
      throw error;
    }
  }

  /**
   * Get user profile by app ID
   */
  async getUserProfile(appId: string): Promise<UserProfile | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { app_id: appId },
      });

      if (!user) {
        return null;
      }

      return {
        app_id: user.app_id,
        contribution_count: user.contribution_count,
        quality_score: user.quality_score ? Number(user.quality_score) : null,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    } catch (error) {
      logger.error('Error getting user profile', { error, appId });
      throw error;
    }
  }

  /**
   * Calculate and update user contribution statistics
   * This should be called after photo submissions are created/updated/deleted
   */
  async updateContributionStats(appId: string): Promise<void> {
    try {
      // Get all non-deleted submissions for this user
      const submissions = await prisma.photoSubmission.findMany({
        where: {
          user_id: appId,
          deleted_at: null,
        },
        select: {
          id: true,
          ai_classification: true,
        },
      });

      const totalSubmissions = submissions.length;

      // Calculate average quality score from AI classifications
      let totalQualityScore = 0;
      let qualityScoreCount = 0;

      for (const submission of submissions) {
        if (submission.ai_classification) {
          const classification = submission.ai_classification as any;
          // Extract quality score from AI classification if available
          if (typeof classification.quality_score === 'number') {
            totalQualityScore += classification.quality_score;
            qualityScoreCount++;
          }
        }
      }

      const averageQualityScore =
        qualityScoreCount > 0 ? totalQualityScore / qualityScoreCount : null;

      // Update user record
      await prisma.user.update({
        where: { app_id: appId },
        data: {
          contribution_count: totalSubmissions,
          quality_score: averageQualityScore
            ? { set: averageQualityScore }
            : { set: null },
        },
      });

      logger.info('User contribution stats updated', {
        app_id: appId,
        contribution_count: totalSubmissions,
        quality_score: averageQualityScore,
      });
    } catch (error) {
      logger.error('Error updating contribution stats', { error, appId });
      throw error;
    }
  }

  /**
   * Get user contribution statistics
   */
  async getContributionStats(appId: string): Promise<UserContributionStats> {
    try {
      const submissions = await prisma.photoSubmission.findMany({
        where: {
          user_id: appId,
          deleted_at: null,
        },
        select: {
          ai_classification: true,
        },
      });

      const totalSubmissions = submissions.length;

      let totalQualityScore = 0;
      let qualityScoreCount = 0;

      for (const submission of submissions) {
        if (submission.ai_classification) {
          const classification = submission.ai_classification as any;
          if (typeof classification.quality_score === 'number') {
            totalQualityScore += classification.quality_score;
            qualityScoreCount++;
          }
        }
      }

      const averageQualityScore =
        qualityScoreCount > 0 ? totalQualityScore / qualityScoreCount : null;

      return {
        total_submissions: totalSubmissions,
        average_quality_score: averageQualityScore,
      };
    } catch (error) {
      logger.error('Error getting contribution stats', { error, appId });
      throw error;
    }
  }

  /**
   * Validate app ID format (UUID v4)
   */
  private isValidAppId(appId: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(appId);
  }

  /**
   * Check if app ID is unique (server-side validation)
   */
  async isAppIdUnique(appId: string): Promise<boolean> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { app_id: appId },
      });
      return !existingUser;
    } catch (error) {
      logger.error('Error checking app ID uniqueness', { error, appId });
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;

