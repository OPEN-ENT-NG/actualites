import { InfoStatus, ThreadInfoStats } from '~/models/info';
import { ThreadId } from '~/models/thread';

/**
 * Creates default info stats for a thread.
 * @param threadId - Optional thread ID
 * @returns Default thread info stats with all counts set to 0
 */
export function defaultThreadInfoStats(threadId?: ThreadId): ThreadInfoStats {
  return {
    id: threadId,
    status: {
      [InfoStatus.PUBLISHED]: 0,
      [InfoStatus.DRAFT]: 0,
      [InfoStatus.TRASH]: 0,
      [InfoStatus.PENDING]: 0,
    },
    expiredCount: 0,
    incomingCount: 0,
  };
}
