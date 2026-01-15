import { useQueryClient } from '@tanstack/react-query';
import { InfosStats, InfoStatus } from '~/models/info';
import { defaultThreadInfoStats } from '~/utils/defaultInfoStats';
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
        // Create default values of missing stats, before updating them.
        threadIndex = oldData.threads.length;
        oldData.threads.push(defaultThreadInfoStats(threadId));
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
