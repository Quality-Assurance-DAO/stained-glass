import logger from './logger';

/**
 * Development logging helpers
 * Provides convenient methods for common development logging scenarios
 */

export const devLogger = {
  /**
   * Log API request details
   */
  logRequest: (method: string, path: string, params?: unknown, query?: unknown) => {
    logger.debug({ method, path, params, query }, 'API Request');
  },

  /**
   * Log API response details
   */
  logResponse: (method: string, path: string, statusCode: number, duration?: number) => {
    logger.debug({ method, path, statusCode, duration }, 'API Response');
  },

  /**
   * Log database query
   */
  logQuery: (query: string, params?: unknown) => {
    logger.debug({ query, params }, 'Database Query');
  },

  /**
   * Log service operation
   */
  logService: (service: string, operation: string, details?: unknown) => {
    logger.debug({ service, operation, details }, 'Service Operation');
  },

  /**
   * Log error with context
   */
  logError: (error: Error, context?: unknown) => {
    logger.error({ err: error, context }, 'Error occurred');
  },
};

export default devLogger;

