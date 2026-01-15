import { useQueryClient } from '@tanstack/react-query';
import { InfosStats, InfoStatus } from '~/models/info';
import { infoQueryKeys } from '../info';

export const useUpdateStatsQueryCache = () => {
  const queryClient = useQueryClient();

  const updateStatsQueryCache = (
    threadId: number,
    status: InfoStatus,
    countDelta: number,
  ) => {
    const queryKey = infoQueryKeys.stats();
    if (!queryClient.getQueryData(queryKey)) return;
    queryClient.setQueryData(queryKey, (oldData: InfosStats): InfosStats => {
      let threadIndex = oldData.threads.findIndex(
        (thread) => thread.id === threadId,
      );
      if (threadIndex < 0) {
        // Create blank stats if not found, before updating them.
        threadIndex = oldData.threads.length;
        oldData.threads.push({
          id: threadId,
          status: { DRAFT: 0, PENDING: 0, PUBLISHED: 0, TRASH: 0 },
          expiredCount: 0,
          incomingCount: 0,
        });
      }

      const targetThread = oldData.threads[threadIndex];

      const oldStatusCount = targetThread.status[status] ?? 0;
      const newStatusCount = Math.max(0, oldStatusCount + countDelta); // countDelta may be negative, but final counter cannot.

      const updatedThreads = oldData.threads.map((thread) => {
        if (thread.id !== threadId) {
          return thread;
        }
        return {
          ...thread,
          status: {
            ...thread.status,
            [status]: newStatusCount,
          },
        };
      });

      return {
        threads: updatedThreads,
      };
    });
  };

  return { updateStatsQueryCache };
};
