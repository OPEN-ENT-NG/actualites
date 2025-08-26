import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { ThreadId, ThreadMode } from '~/models/thread';
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
      staleTime: 5 * 60 * 1000, // 5 minutes
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
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },
};

export const useThreads = () => useQuery(threadQueryOptions.getThreads());
export const useThreadShares = (threadId: ThreadId) =>
  useQuery(threadQueryOptions.getShares(threadId));

export const useCreateThread = () =>
  useMutation({
    mutationFn: (payload: { mode: ThreadMode; title: string }) =>
      threadService.create(payload),
    // TODO optimistic update
    // onSuccess: async (, { mode, title }) => {
    // },
  });

export const useUpdateThread = () =>
  useMutation({
    mutationFn: ({
      threadId,
      payload,
    }: {
      threadId: ThreadId;
      payload: { mode: ThreadMode; title: string };
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
