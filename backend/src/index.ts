import { startServer } from './api/app';
import logger from './utils/logger';
import prisma from './config/database';

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');
    
    // Start the server after database connection succeeds
    startServer();
  } catch (error) {
    logger.error({ error }, 'Failed to connect to database');
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error({ error }, 'Unhandled error in main');
  process.exit(1);
});

