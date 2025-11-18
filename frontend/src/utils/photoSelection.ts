import { WindowSubmission } from '../services/api/windows';

/**
 * Select the primary (best) photo from a list of submissions
 * Priority: arweave_tx_id exists > largest image_hash (proxy for size) > most recent
 */
export function selectPrimaryPhoto(submissions: WindowSubmission[]): WindowSubmission | null {
  if (submissions.length === 0) {
    return null;
  }

  // Filter out submissions without Arweave transaction (not yet uploaded)
  const uploaded = submissions.filter((s) => s.arweave_tx_id);
  const candidates = uploaded.length > 0 ? uploaded : submissions;

  // Sort by: has arweave_tx_id > image_hash length (proxy for size) > timestamp
  const sorted = [...candidates].sort((a, b) => {
    // First priority: has Arweave transaction
    if (a.arweave_tx_id && !b.arweave_tx_id) return -1;
    if (!a.arweave_tx_id && b.arweave_tx_id) return 1;

    // Second priority: image hash length (longer hash might indicate larger file)
    // This is a heuristic - in practice, you'd want actual image dimensions
    const hashDiff = (b.image_hash?.length || 0) - (a.image_hash?.length || 0);
    if (hashDiff !== 0) return hashDiff;

    // Third priority: most recent
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return sorted[0];
}



