import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Thread,
  ThreadId,
  ThreadPayload,
  ThreadQueryPayload,
} from '~/models/thread';
import { threadService } from '../api';

export const threadQueryKeys = {
  all: () => ['threads'] as const,
  thread: (threadId?: ThreadId) => [...threadQueryKeys.all(), threadId],
  share: (threadId: ThreadId) => [
    ...threadQueryKeys.thread(threadId),
    'share',
    'json',
  ],
};

/**
 * Provides query options for thread-related operations.
 */
export const threadQueryOptions = {
  /**
   * @returns Query options for fetching the threads.
   */
  getThreads() {
    return queryOptions({
      queryKey: threadQueryKeys.all(),
      queryFn: () => threadService.getThreads(),
    });
  },

  /**
   * Retrieves the share rights on a thread.
   *
   * @param threadId - The ID of the thread.
   * @returns Query options for fetching the share rights.
   */
  getShares(threadId: ThreadId) {
    return queryOptions({
      queryKey: threadQueryKeys.share(threadId),
      queryFn: () => threadService.getShares(threadId),
    });
  },
};

export const useThreads = () => useQuery(threadQueryOptions.getThreads());
export const useThreadShares = (threadId: ThreadId) =>
  useQuery(threadQueryOptions.getShares(threadId));

export const useCreateThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queryPayload: ThreadQueryPayload) => {
      const payload: ThreadPayload = {
        ...queryPayload,
        structure: queryPayload.structure?.id
          ? { id: queryPayload.structure.id }
          : undefined,
      };
      return threadService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: threadQueryKeys.all() });
    },
  });
};

export const useUpdateThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      threadId,
      payload,
    }: {
      threadId: ThreadId;
      payload: ThreadQueryPayload;
    }) => threadService.update(threadId, payload),
    onSuccess: (_, { threadId, payload }) => {
      // Update the thread in the cache optimistically
      if (
        queryClient.getQueryData<Thread[]>(threadQueryKeys.thread(threadId))
      ) {
        queryClient.setQueryData(
          threadQueryKeys.thread(threadId),
          (oldData: Thread | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              title: payload.title,
              icon: payload.icon || null,
              mode: payload.mode,
              modified: new Date().toISOString(),
              structure: payload.structure
                ? { id: payload.structure.id, name: '' }
                : null,
              structureId: payload.structure ? payload.structure.id : null,
            };
          },
        );
      }

      // Update thread list in the cache
      queryClient.setQueryData(threadQueryKeys.all(), (oldData: Thread[]) => {
        const updatedThreadList = oldData.map((thread) => {
          if (thread.id === threadId) {
            return {
              ...thread,
              title: payload.title,
              icon: payload.icon || null,
              mode: payload.mode,
              modified: new Date().toISOString(),
              structure: payload.structure
                ? { id: payload.structure.id, name: '' }
                : null,
              structureId: payload.structure ? payload.structure.id : null,
            };
          }
          return thread;
        });
        return updatedThreadList.sort((a, b) => a.title.localeCompare(b.title));
      });
    },
  });
};

export const useDeleteThread = () =>
  useMutation({
    mutationFn: (threadId: ThreadId) => threadService.delete(threadId),
    // TODO optimistic update
    // onSuccess: async (, { mode, title }) => {
    // },
  });
