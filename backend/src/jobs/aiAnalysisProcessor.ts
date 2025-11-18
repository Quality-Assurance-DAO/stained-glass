import prisma from '../config/database';
import aiService from '../services/AIService';
import logger from '../utils/logger';
import windowService from '../services/WindowService';

export interface AIAnalysisJob {
  submissionId: string;
  imageBuffer: Buffer;
  imageHash: string;
  churchId: string;
}

/**
 * Process AI analysis for a photo submission
 * This runs asynchronously after photo upload
 */
export async function processAIAnalysis(job: AIAnalysisJob): Promise<void> {
  const { submissionId, imageBuffer, imageHash, churchId } = job;

  try {
    logger.info('Starting AI analysis', { submissionId, imageHash });

    // Get windows for this church to help with identification
    const windows = await windowService.getWindowsByChurchId(churchId);
    const windowsForAI = windows.map((w) => ({
      id: w.id,
      location_description: w.location_description || undefined,
    }));

    // Perform AI analysis
    const analysisResult = await aiService.analyzeImage(
      imageBuffer,
      imageHash,
      churchId,
      windowsForAI
    );

    // Update submission with AI analysis results
    await prisma.photoSubmission.update({
      where: { id: submissionId },
      data: {
        ai_classification: analysisResult as any,
      },
    });

    logger.info('AI analysis completed', {
      submissionId,
      isStainedGlass: analysisResult.classification.isStainedGlassWindow,
      qualityScore: analysisResult.quality.score,
      shouldFilter: analysisResult.shouldFilter,
      suggestedWindowId: analysisResult.windowIdentification?.suggestedWindowId,
    });

    // If image should be filtered, log it (but don't delete - let admin review)
    if (analysisResult.shouldFilter) {
      logger.warn('Image flagged for filtering', {
        submissionId,
        filterReason: analysisResult.filterReason,
      });
    }

    // Auto-assign window if AI suggests one with high confidence
    if (
      analysisResult.windowIdentification?.suggestedWindowId &&
      analysisResult.windowIdentification.confidence >= 0.8
    ) {
      try {
        const photoSubmissionService = (await import('../services/PhotoSubmissionService'))
          .default;
        await photoSubmissionService.assignToWindow(
          submissionId,
          analysisResult.windowIdentification.suggestedWindowId
        );
        logger.info('Auto-assigned window based on AI suggestion', {
          submissionId,
          windowId: analysisResult.windowIdentification.suggestedWindowId,
          confidence: analysisResult.windowIdentification.confidence,
        });
      } catch (error: any) {
        logger.error('Failed to auto-assign window', {
          error,
          submissionId,
          windowId: analysisResult.windowIdentification.suggestedWindowId,
        });
        // Don't throw - assignment can be done manually later
      }
    }
  } catch (error: any) {
    logger.error('AI analysis processing failed', {
      error,
      submissionId,
      imageHash,
    });

    // Mark analysis as failed but don't block the submission
    try {
      await prisma.photoSubmission.update({
        where: { id: submissionId },
        data: {
          ai_classification: {
            error: 'AI analysis failed',
            timestamp: new Date().toISOString(),
          } as any,
        },
      });
    } catch (updateError: any) {
      logger.error('Failed to update submission with AI error', {
        error: updateError,
        submissionId,
      });
    }

    // Don't throw - allow submission to proceed without AI analysis
  }
}

/**
 * Process AI analysis for multiple submissions (batch processing)
 */
export async function processBatchAIAnalysis(jobs: AIAnalysisJob[]): Promise<void> {
  logger.info('Processing batch AI analysis', { count: jobs.length });

  // Process in parallel (with reasonable concurrency limit)
  const concurrencyLimit = 5;
  const results = [];

  for (let i = 0; i < jobs.length; i += concurrencyLimit) {
    const batch = jobs.slice(i, i + concurrencyLimit);
    const batchPromises = batch.map((job) =>
      processAIAnalysis(job).catch((error) => {
        logger.error('Batch AI analysis job failed', { error, job });
        return null;
      })
    );
    results.push(...(await Promise.all(batchPromises)));
  }

  logger.info('Batch AI analysis completed', {
    total: jobs.length,
    successful: results.filter((r) => r !== null).length,
  });
}

