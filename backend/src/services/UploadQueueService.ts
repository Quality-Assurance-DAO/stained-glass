import prisma from '../config/database';
import logger from '../utils/logger';

export type QueueType = 'arweave' | 'cardano';
export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface CreateQueueEntryParams {
  submissionId: string;
  queueType: QueueType;
  payload: Record<string, any>;
}

export interface RetrySchedule {
  retryCount: number;
  nextRetryAt: Date;
}

/**
 * Calculate next retry time using exponential backoff
 * Schedule: 1min, 5min, 15min, 1hr, 6hr
 */
function calculateNextRetry(retryCount: number): Date {
  const schedules = [
    1 * 60 * 1000, // 1 minute
    5 * 60 * 1000, // 5 minutes
    15 * 60 * 1000, // 15 minutes
    60 * 60 * 1000, // 1 hour
    6 * 60 * 60 * 1000, // 6 hours
  ];

  const delayMs =
    retryCount < schedules.length
      ? schedules[retryCount]
      : schedules[schedules.length - 1]; // Use max delay for retries beyond schedule

  return new Date(Date.now() + delayMs);
}

export class UploadQueueService {
  /**
   * Create a new queue entry
   */
  async createQueueEntry(params: CreateQueueEntryParams) {
    try {
      const queueEntry = await prisma.uploadQueue.create({
        data: {
          submission_id: params.submissionId,
          queue_type: params.queueType,
          payload: params.payload,
          status: 'pending',
          retry_count: 0,
        },
      });

      logger.info('Queue entry created', {
        queueId: queueEntry.id,
        submissionId: params.submissionId,
        queueType: params.queueType,
      });

      return queueEntry;
    } catch (error) {
      logger.error('Error creating queue entry', { error, params });
      throw error;
    }
  }

  /**
   * Get pending queue entries ready for retry
   */
  async getPendingEntries(queueType?: QueueType, limit: number = 10) {
    try {
      const where: any = {
        status: {
          in: ['pending', 'failed'],
        },
        OR: [
          { next_retry_at: null },
          { next_retry_at: { lte: new Date() } },
        ],
      };

      if (queueType) {
        where.queue_type = queueType;
      }

      const entries = await prisma.uploadQueue.findMany({
        where,
        include: {
          submission: true,
        },
        orderBy: {
          created_at: 'asc',
        },
        take: limit,
      });

      return entries;
    } catch (error) {
      logger.error('Error getting pending queue entries', { error });
      throw error;
    }
  }

  /**
   * Mark queue entry as processing
   */
  async markProcessing(queueId: string) {
    try {
      return await prisma.uploadQueue.update({
        where: { id: queueId },
        data: {
          status: 'processing',
          updated_at: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error marking queue entry as processing', { error, queueId });
      throw error;
    }
  }

  /**
   * Mark queue entry as completed
   */
  async markCompleted(queueId: string, result?: Record<string, any>) {
    try {
      return await prisma.uploadQueue.update({
        where: { id: queueId },
        data: {
          status: 'completed',
          payload: result ? { ...result } : undefined,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error marking queue entry as completed', { error, queueId });
      throw error;
    }
  }

  /**
   * Mark queue entry as failed and schedule retry
   */
  async markFailed(
    queueId: string,
    errorMessage: string,
    maxRetries: number = 10
  ) {
    try {
      const entry = await prisma.uploadQueue.findUnique({
        where: { id: queueId },
      });

      if (!entry) {
        throw new Error(`Queue entry ${queueId} not found`);
      }

      const newRetryCount = entry.retry_count + 1;

      if (newRetryCount >= maxRetries) {
        // Max retries reached, mark as failed permanently
        logger.error('Queue entry exceeded max retries', {
          queueId,
          retryCount: newRetryCount,
        });
        return await prisma.uploadQueue.update({
          where: { id: queueId },
          data: {
            status: 'failed',
            error_message: `${errorMessage} (Max retries exceeded)`,
            retry_count: newRetryCount,
            updated_at: new Date(),
          },
        });
      }

      // Schedule next retry
      const nextRetryAt = calculateNextRetry(newRetryCount);

      logger.warn('Queue entry failed, scheduling retry', {
        queueId,
        retryCount: newRetryCount,
        nextRetryAt,
        errorMessage,
      });

      return await prisma.uploadQueue.update({
        where: { id: queueId },
        data: {
          status: 'pending',
          error_message: errorMessage,
          retry_count: newRetryCount,
          next_retry_at: nextRetryAt,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error marking queue entry as failed', { error, queueId });
      throw error;
    }
  }

  /**
   * Get queue entry by ID
   */
  async getQueueEntry(queueId: string) {
    try {
      return await prisma.uploadQueue.findUnique({
        where: { id: queueId },
        include: {
          submission: true,
        },
      });
    } catch (error) {
      logger.error('Error getting queue entry', { error, queueId });
      throw error;
    }
  }

  /**
   * Get queue entries for a submission
   */
  async getQueueEntriesBySubmissionId(submissionId: string) {
    try {
      return await prisma.uploadQueue.findMany({
        where: { submission_id: submissionId },
        orderBy: {
          created_at: 'desc',
        },
      });
    } catch (error) {
      logger.error('Error getting queue entries by submission ID', {
        error,
        submissionId,
      });
      throw error;
    }
  }
}

export default new UploadQueueService();

