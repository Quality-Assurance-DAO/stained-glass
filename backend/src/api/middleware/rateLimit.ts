import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import logger from '../../utils/logger';

/**
 * Rate limiter for photo uploads: 10 uploads per hour per app ID
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Too many uploads, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  // Custom key generator to rate limit by app ID
  keyGenerator: (req: Request): string => {
    const appId = req.body.user_id || req.headers['x-app-id'] || req.ip;
    return `upload:${appId}`;
  },
  // Custom handler for rate limit exceeded
  handler: (req: Request, res: Response) => {
    const appId = req.body.user_id || req.headers['x-app-id'] || req.ip;
    logger.warn('Rate limit exceeded for photo upload', { appId, ip: req.ip });
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Maximum 10 uploads per hour. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit?.resetTime ? (req.rateLimit.resetTime - Date.now()) / 1000 : 3600),
    });
  },
  // Skip rate limiting if in development/test mode
  skip: (req: Request) => {
    return process.env.NODE_ENV === 'test';
  },
});

/**
 * Progressive delay middleware for rate limit exceeded
 * Adds increasing delays when rate limit is approached
 */
export const progressiveDelay = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const rateLimitInfo = req.rateLimit;
  if (rateLimitInfo && rateLimitInfo.remaining < 3) {
    // If fewer than 3 requests remaining, add a delay
    const delayMs = (4 - rateLimitInfo.remaining) * 1000; // 1s, 2s, 3s delays
    logger.debug('Applying progressive delay', {
      remaining: rateLimitInfo.remaining,
      delayMs,
    });
    setTimeout(() => next(), delayMs);
  } else {
    next();
  }
};

