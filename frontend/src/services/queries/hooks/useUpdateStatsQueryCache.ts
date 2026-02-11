import { useQueryClient } from '@tanstack/react-query';
import { InfoExtendedStatus, InfosStats, InfoStatus } from '~/models/info';
import { defaultThreadInfoStats } from '~/utils/defaultInfoStats';
import { infoQueryKeys } from '../info';

export const useUpdateStatsQueryCache = () => {
  const queryClient = useQueryClient();

  const updateStatsQueryCache = (
    threadId: number,
    status: InfoStatus,
    countDelta: number,
    state?: InfoExtendedStatus,
  ) => {
    const queryKey = infoQueryKeys.stats();
    if (!queryClient.getQueryData(queryKey)) return;
    queryClient.setQueryData(queryKey, (oldData: InfosStats): InfosStats => {
      let threadIndex = oldData.threads.findIndex(
        (thread) => thread.id === threadId,
      );
      if (threadIndex < 0) {
        threadIndex = oldData.threads.length;
        oldData.threads.push(defaultThreadInfoStats(threadId));
      }

      const targetThread = oldData.threads[threadIndex];
      let updatedThreads = oldData.threads;
      if (state) {
        const stateString =
          state === InfoExtendedStatus.INCOMING
            ? 'incomingCount'
            : 'expiredCount';
        const oldStatusCount = targetThread[stateString] ?? 0;
        const newStatusCount = Math.max(0, oldStatusCount + countDelta); // countDelta may be negative, but final counter cannot.

        updatedThreads = oldData.threads.map((thread) => {
          if (thread.id !== threadId) {
            return thread;
          }
          return {
            ...thread,
            [stateString]: newStatusCount,
          };
        });
      } else {
        const oldStatusCount = targetThread.status[status] ?? 0;
        const newStatusCount = Math.max(0, oldStatusCount + countDelta); // countDelta may be negative, but final counter cannot.

        updatedThreads = oldData.threads.map((thread) => {
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
      }

      return {
        threads: updatedThreads,
      };
    });
  };

  return { updateStatsQueryCache };
};
