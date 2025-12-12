import { useToast } from '@edifice.io/react';
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useI18n } from '~/hooks/useI18n';
import {
  Thread,
  ThreadId,
  ThreadPayload,
  ThreadQueryPayload,
} from '~/models/thread';
import { threadService } from '../api';

interface OnMutateResult {
  queryKey: (string | number)[];
  data: any;
}

export const threadQueryKeys = {
  all: () => ['threads'],
  thread: (threadId?: ThreadId) =>
    threadId ? [...threadQueryKeys.all(), threadId] : threadQueryKeys.all(),
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
        structure: {
          id: queryPayload.structure.id,
        },
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
  const { t } = useI18n();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      threadId,
      payload,
    }: {
      threadId: ThreadId;
      payload: ThreadQueryPayload;
    }) => threadService.update(threadId, payload),
    onMutate: async ({ threadId, payload }): Promise<OnMutateResult[]> => {
      const newThreadData = {
        title: payload.title,
        icon: payload.icon || null,
        mode: payload.mode,
        modified: new Date().toISOString(),
        structure: { id: payload.structure.id, name: payload.structure.name },
        structureId: payload.structure ? payload.structure.id : null,
      };

      const previousData: { queryKey: (string | number)[]; data: any }[] = [];

      // Update the thread in the cache optimistically
      if (
        queryClient.getQueryData<Thread[]>(threadQueryKeys.thread(threadId))
      ) {
        queryClient.setQueryData(
          threadQueryKeys.thread(threadId),
          (oldData: Thread | undefined) => {
            previousData.push({
              queryKey: threadQueryKeys.thread(threadId),
              data: oldData,
            });
            if (!oldData) return oldData;
            return {
              ...oldData,
              ...newThreadData,
            };
          },
        );
      }

      // Update thread list in the cache
      queryClient.setQueryData(threadQueryKeys.all(), (oldData: Thread[]) => {
        previousData.push({
          queryKey: threadQueryKeys.all(),
          data: oldData,
        });
        if (!oldData) return oldData;
        const updatedThreadList = oldData.map((thread) => {
          if (thread.id === threadId) {
            return {
              ...thread,
              ...newThreadData,
            };
          }
          return thread;
        });
        return updatedThreadList.sort((a, b) => a.title.localeCompare(b.title));
      });

      return previousData;
    },
    onSuccess: () => {
      toast.success(t('actualites.adminThreads.modal.updateSuccess'));
    },
    onError: (_err, _variables, onMutateResult) => {
      if (onMutateResult) {
        onMutateResult.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
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
