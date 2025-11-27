import { useMemo } from 'react';
import { InfoStatus, InfosStats, ThreadInfoStats } from '~/models/info';
import { ThreadId } from '~/models/thread';

/**
 * Creates default info stats for a thread.
 * @param threadId - Optional thread ID
 * @returns Default thread info stats with all counts set to 0
 */
function defaultInfoStats(threadId?: ThreadId): ThreadInfoStats {
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

/**
 * Calculates total stats by aggregating stats from all threads.
 * @param infosStats - The stats from all threads
 * @returns Aggregated stats with id set to undefined
 */
function calculateTotalStats(
  infosStats: InfosStats | undefined,
): ThreadInfoStats {
  return (
    infosStats?.threads?.reduce(
      (acc, thread) => ({
        id: undefined,
        status: {
          [InfoStatus.PUBLISHED]:
            acc.status[InfoStatus.PUBLISHED] +
            thread.status[InfoStatus.PUBLISHED],
          [InfoStatus.DRAFT]:
            acc.status[InfoStatus.DRAFT] + thread.status[InfoStatus.DRAFT],
          [InfoStatus.TRASH]:
            acc.status[InfoStatus.TRASH] + thread.status[InfoStatus.TRASH],
          [InfoStatus.PENDING]:
            acc.status[InfoStatus.PENDING] + thread.status[InfoStatus.PENDING],
        },
        expiredCount: acc.expiredCount + thread.expiredCount,
        incomingCount: acc.incomingCount + thread.incomingCount,
      }),
      defaultInfoStats(undefined),
    ) ?? defaultInfoStats(undefined)
  );
}

/**
 * Hook to get info stats for a specific thread or total stats if no threadId is provided.
 * @param infosStats - The stats from all threads
 * @param threadId - Optional thread ID to get stats for a specific thread
 * @returns The stats for the specified thread or total stats if no threadId is provided
 */
export function useInfoStats(
  infosStats: InfosStats | undefined,
  threadId?: ThreadId,
): ThreadInfoStats {
  return useMemo(() => {
    if (!threadId) {
      return calculateTotalStats(infosStats);
    }

    const threadInfoStats = infosStats?.threads?.find(
      (thread) => thread.id === threadId,
    );
    return threadInfoStats ?? defaultInfoStats(threadId);
  }, [infosStats, threadId]);
}
