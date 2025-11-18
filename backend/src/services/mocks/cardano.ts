import logger from '../../utils/logger';

/**
 * Mock Cardano service for development/testing
 * Returns mock transaction hashes without actually submitting to Cardano
 */
export class MockCardanoService {
  async createAuditTrailTransaction(
    submissionId: string,
    action: 'upload' | 'edit' | 'delete',
    metadata: Record<string, unknown>
  ): Promise<string> {
    logger.info(`Mock Cardano: Creating audit trail transaction for ${action} (mock)`);
    // Return mock transaction hash
    const mockTxHash = `mock-cardano-tx-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    logger.info(`Mock Cardano: Generated mock transaction hash: ${mockTxHash}`);
    return mockTxHash;
  }

  async getTransaction(txHash: string): Promise<unknown> {
    logger.info(`Mock Cardano: Retrieving transaction ${txHash} (mock)`);
    return {
      hash: txHash,
      blockHeight: 12345,
      timestamp: Date.now(),
      metadata: {},
    };
  }
}

export const mockCardanoService = new MockCardanoService();

