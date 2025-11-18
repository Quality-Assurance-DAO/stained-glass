import logger from '../../utils/logger';

/**
 * Mock Arweave service for development/testing
 * Returns mock transaction IDs without actually uploading to Arweave
 */
export class MockArweaveService {
  async uploadImage(imageBuffer: Buffer, metadata: Record<string, unknown>): Promise<string> {
    logger.info('Mock Arweave: Uploading image (mock)');
    // Return mock transaction ID
    const mockTxId = `mock-arweave-tx-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    logger.info(`Mock Arweave: Generated mock transaction ID: ${mockTxId}`);
    return mockTxId;
  }

  async uploadMetadata(metadata: Record<string, unknown>): Promise<string> {
    logger.info('Mock Arweave: Uploading metadata (mock)');
    const mockTxId = `mock-arweave-metadata-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    logger.info(`Mock Arweave: Generated mock transaction ID: ${mockTxId}`);
    return mockTxId;
  }

  async getTransaction(txId: string): Promise<unknown> {
    logger.info(`Mock Arweave: Retrieving transaction ${txId} (mock)`);
    return {
      id: txId,
      owner: 'mock-owner',
      data: 'mock-data',
      tags: [],
      block: { height: 12345 },
      timestamp: Date.now(),
    };
  }
}

export const mockArweaveService = new MockArweaveService();

