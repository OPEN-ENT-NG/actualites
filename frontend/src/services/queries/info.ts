import { ShareRight } from '@edifice.io/client';
import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Info, InfoExtendedStatus, InfoId, InfoStatus } from '~/models/info';
import { ThreadId } from '~/models/thread';
import { infoService } from '../api';
import { threadQueryKeys } from './thread';

export const DEFAULT_PAGE_SIZE = 20;

/*********************************************************************************
 * Info Query Keys always follow this format :
 * ['threads', threadId|undefined, 'infos', infoId|undefined, ...other_parameters]
 */
export const infoQueryKeys = {
  all: ({ threadId }: { threadId?: ThreadId }) => [
    ...threadQueryKeys.thread(threadId),
    'infos',
  ],

  info: ({ infoId, ...options }: { infoId?: InfoId; threadId?: ThreadId }) => [
    ...infoQueryKeys.all(options),
    infoId,
  ],

  infos: ({
    ...options
  }: {
    threadId?: ThreadId;
    status?: InfoStatus;
    state?: InfoExtendedStatus;
  }) => [
    ...infoQueryKeys.all({ threadId: options.threadId }),
    options.status,
    options.state,
  ],

  share: (options: { threadId?: ThreadId; infoId: InfoId }) => [
    ...infoQueryKeys.info(options),
    'share',
    'json',
  ],

  stats: () => [...infoQueryKeys.all({}), 'stats'],

  revisions: (options: { infoId: InfoId }) => [
    ...infoQueryKeys.info(options),
    'revisions',
  ],

  originalFormat: (options: { threadId?: ThreadId; infoId?: InfoId }) => [
    ...infoQueryKeys.info(options),
    'originalFormat',
  ],
};

/*********************************************************************************
 * Provides query options for info-related operations.
 */
export const infoQueryOptions = {
  /**
   * Get an Info by its ID.
   * @param infoId - The ID of the Info to retrieve.
   * @returns Query options for fetching the Info.
   */
  getInfoById(infoId?: InfoId) {
    return queryOptions({
      queryKey: infoQueryKeys.info({ infoId }),
      queryFn: () => infoService.getInfo({ infoId: infoId! }),
      enabled: !!infoId,
      staleTime: Infinity, // will be unvalidated manually when needed only,
    });
  },

  /**
   * Get a page of infos, optionnally from a given thread.
   * @param options - The options for fetching the infos.
   * @param options.pageSize - The number of infos to fetch per page.
   * @param options.threadId - The ID of the thread to fetch the infos from.
   * @param options.status - The status of the infos to fetch.
   * @param options.state - The state of the infos to fetch.
   * @returns Query options for fetching a page of infos, optionnally from a given thread.
   */
  getInfos(options: {
    pageSize: number;
    threadId?: ThreadId;
    status?: InfoStatus;
    state?: InfoExtendedStatus;
  }) {
    return infiniteQueryOptions({
      queryKey: infoQueryKeys.infos(options),
      queryFn: ({ pageParam = 0 }) => {
        return infoService.getInfos({
          ...options,
          page: pageParam,
        });
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      initialPageParam: 0,
      getNextPageParam: (
        lastPage: Info[],
        _allPages: Info[][],
        lastPageParam: number,
      ) => {
        if (lastPage?.length === options.pageSize) {
          return lastPageParam + 1;
        }
        return undefined;
      },
    });
  },

  /**
   * Get the stats of all infos.
   * @returns The stats of all infos.
   */
  getStats(enabled?: boolean) {
    return queryOptions({
      queryKey: infoQueryKeys.stats(),
      queryFn: () => infoService.getStats(),
      enabled: enabled ?? true,
    });
  },

  /**
   * Retrieves the share rights for an info.
   *
   * @param threadId - The ID of the thread.
   * @param infoId - The ID of the info.
   * @returns Query options for fetching the share rights.
   */
  getShares(infoId: InfoId) {
    return queryOptions({
      queryKey: infoQueryKeys.share({ infoId }),
      queryFn: () => infoService.getShares(infoId),
    });
  },

  getRevisions(infoId: InfoId) {
    return queryOptions({
      queryKey: infoQueryKeys.revisions({ infoId }),
      queryFn: () => infoService.getRevisions(infoId),
    });
  },

  getOriginalFormat(threadId: ThreadId, infoId: InfoId) {
    return queryOptions({
      queryKey: infoQueryKeys.originalFormat({ infoId, threadId }),
      queryFn: () => infoService.getOriginalFormat(threadId, infoId),
      enabled: !!threadId && !!infoId,
    });
  },
};

//*******************************************************************************
// Hooks
export const useInfoById = (infoId?: InfoId) =>
  useQuery(infoQueryOptions.getInfoById(infoId));

export const useInfos = (
  threadId?: ThreadId,
  options?: {
    pageSize?: number;
    status?: InfoStatus;
    state?: InfoExtendedStatus;
  },
) => {
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  return useInfiniteQuery(
    infoQueryOptions.getInfos({ pageSize, threadId, ...options }),
  );
};

export const useInfoShares = (infoId: InfoId) =>
  useQuery(infoQueryOptions.getShares(infoId));
export const useInfosStats = (options?: { enabled?: boolean }) =>
  useQuery(infoQueryOptions.getStats(options?.enabled));

export const useInfoRevisions = (infoId: InfoId) =>
  useQuery(infoQueryOptions.getRevisions(infoId));

export const useInfoOriginalFormat = (threadId: ThreadId, infoId: InfoId) =>
  useQuery(infoQueryOptions.getOriginalFormat(threadId, infoId));

export const useCreateDraftInfo = () =>
  useMutation({
    mutationFn: (payload: {
      title?: string;
      content?: string;
      thread_id?: number;
      is_headline?: boolean;
    }) => infoService.createDraft(payload),
    // TODO optimistic update
    // onSuccess: async (, { title, content, threadId }) => {
    // },
  });

export const useUpdateInfo = () =>
  useMutation({
    mutationFn: ({
      infoId,
      infoStatus,
      payload,
    }: {
      infoId: InfoId;
      infoStatus: InfoStatus;
      payload: {
        thread_id?: ThreadId;
        title?: string;
        content?: string;
        is_headline?: boolean;
        publication_date?: string;
        expiration_date?: string;
      };
    }) => infoService.update(infoId, infoStatus, payload),
    // TODO optimistic update
  });

export const useSharesInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      resourceId,
      rights,
    }: {
      resourceId: InfoId;
      rights: ShareRight[];
    }) => infoService.putShares(resourceId, rights),
    onSuccess: (_, { resourceId }) => {
      queryClient.invalidateQueries({
        queryKey: infoQueryKeys.share({ infoId: resourceId }),
      });
    },
  });
};

export const useSubmitInfo = () =>
  useMutation({
    mutationFn: ({
      threadId,
      infoId,
      payload,
    }: {
      threadId: ThreadId;
      infoId: InfoId;
      payload: {
        title: string;
      };
    }) => infoService.submit(threadId, infoId, payload),
    // TODO optimistic update
  });

export const useUnsubmitInfo = () =>
  useMutation({
    mutationFn: ({
      threadId,
      infoId,
    }: {
      threadId: ThreadId;
      infoId: InfoId;
    }) => infoService.unsubmit(threadId, infoId),
    // TODO optimistic update
  });

export const usePublishInfo = () =>
  useMutation({
    mutationFn: ({
      threadId,
      infoId,
      payload,
    }: {
      threadId: ThreadId;
      infoId: InfoId;
      payload: {
        title: string;
        owner: string; // ID of the owner, for timeline notification.
        username: string; // name of the owner, for timeline notification.
      };
    }) => infoService.publish(threadId, infoId, payload),
    // TODO optimistic update
  });

export const useDeleteInfo = () =>
  useMutation({
    mutationFn: ({
      threadId,
      infoId,
    }: {
      threadId: ThreadId;
      infoId: InfoId;
    }) => infoService.delete(threadId, infoId),
    // TODO optimistic update
  });
