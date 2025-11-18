import crypto from 'crypto';
import { Readable } from 'stream';

/**
 * Calculate SHA-256 hash of an image buffer
 */
export async function calculateImageHash(buffer: Buffer): Promise<string> {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Calculate SHA-256 hash of a file stream
 */
export async function calculateImageHashFromStream(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

