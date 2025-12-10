import { useEdificeClient } from '@edifice.io/react';
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
  const { user } = useEdificeClient();
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
    onSuccess: ({ id }, threadPayload) => {
      queryClient.setQueryData(
        threadQueryKeys.all(),
        (oldData: Thread[] | undefined) => {
          const newThread: Thread = {
            id,
            title: threadPayload.title,
            icon: threadPayload.icon || null,
            mode: threadPayload.mode,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            structure: threadPayload.structure
              ? { id: threadPayload.structure.id, name: '' }
              : null,
            structureId: threadPayload.structure
              ? threadPayload.structure.id
              : null,
            owner: user?.userId || '',
            username: user?.username || '',
          };
          if (oldData) {
            return [...oldData, newThread].sort((a, b) =>
              a.title.localeCompare(b.title),
            );
          } else {
            return [newThread];
          }
        },
      );
    },
  });
};

export const useUpdateThread = () =>
  useMutation({
    mutationFn: ({
      threadId,
      payload,
    }: {
      threadId: ThreadId;
      payload: ThreadQueryPayload;
    }) => threadService.update(threadId, payload),
    // TODO optimistic update
    // onSuccess: async (, { mode, title }) => {
    // },
  });

export const useDeleteThread = () =>
  useMutation({
    mutationFn: (threadId: ThreadId) => threadService.delete(threadId),
    // TODO optimistic update
    // onSuccess: async (, { mode, title }) => {
    // },
  });
