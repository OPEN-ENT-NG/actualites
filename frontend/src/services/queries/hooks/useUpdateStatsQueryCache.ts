import { InfosStats, InfoStatus } from '~/models/info';
import { infoQueryKeys } from '../info';
import { useQueryClient } from '@tanstack/react-query';

export const useUpdateStatsQueryCache = () => {
  const queryClient = useQueryClient();

  const updateStatsQueryCache = (
    threadId: number,
    status: InfoStatus,
    countDelta: number,
  ) => {
    const queryKey = infoQueryKeys.stats();
    if (!queryClient.getQueryData(queryKey)) return;
    queryClient.setQueryData(queryKey, (oldData: InfosStats) => {
      const targetThread = oldData.threads.find(
        (thread) => thread.id === threadId,
      );
      const oldStatusCount = targetThread?.status[status] ?? 0;
      const newStatusCount = oldStatusCount + countDelta;

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
