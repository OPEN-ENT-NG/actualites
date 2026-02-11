import { invalidateQueriesWithFirstPage } from '@edifice.io/react';
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
import { useInfoAudienceStore } from '~/store/audienceStore';
import { infoService } from '../api';
import { useUpdateStatsQueryCache } from './hooks/useUpdateStatsQueryCache';

export const DEFAULT_PAGE_SIZE = 20;

/*********************************************************************************
 * Info Query Keys always follow this format :
 * ['threads', threadId|undefined, 'infos', infoId|undefined, ...other_parameters]
 */

export type InfoQueryKeysParams = {
  threadId: ThreadId | 'all';
  status?: InfoStatus;
  state?: InfoExtendedStatus;
};
export const infoQueryKeys = {
  // ['infos']
  all: () => ['infos'],

  // ['infos', 'stats']
  stats: () => [...infoQueryKeys.all(), 'stats'],

  // List
  // ['infos', 'thread', 'all', 'expired']
  // ['infos', 'thread', 134, 'expired']
  byThread: (options: InfoQueryKeysParams) => {
    const queryKey: any = [...infoQueryKeys.all(), 'thread', options.threadId];
    if (options.status) queryKey.push(options.status);
    if (options.state) queryKey.push(options.state);
    return queryKey;
  },

  // Details
  // ['infos', 'details', 234]
  info: ({ infoId }: { infoId?: InfoId }) => [
    ...infoQueryKeys.all(),
    'details',
    infoId,
  ],

  // ['infos', 'details', 234, 'share', 'json']
  share: (options: { threadId?: ThreadId; infoId: InfoId }) => [
    ...infoQueryKeys.info(options),
    'share',
    'json',
  ],

  // ['infos', 'details', 234, 'revisions']
  revisions: (options: { infoId: InfoId }) => [
    ...infoQueryKeys.info(options),
    'revisions',
  ],

  // ['infos', 'details', 234, 'originalFormat']
  originalFormat: (options: { threadId?: ThreadId; infoId?: InfoId }) => [
    ...infoQueryKeys.info(options),
    'originalFormat',
  ],

  viewsDetails: (options: { infoId: InfoId }) => [
    ...infoQueryKeys.info(options),
    'viewsDetails',
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
      queryKey: infoQueryKeys.byThread({
        threadId: options.threadId ?? 'all',
        status: options.status,
        state: options.state,
      }),
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

  getViewsDetails(infoId: InfoId) {
    return queryOptions({
      queryKey: infoQueryKeys.viewsDetails({ infoId }),
      queryFn: () => infoService.getViewsDetails(infoId),
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

export const useInfoViewsDetails = (infoId: InfoId) =>
  useQuery(infoQueryOptions.getViewsDetails(infoId));

export const useCreateDraftInfo = () => {
  const queryClient = useQueryClient();
  const { updateStatsQueryCache } = useUpdateStatsQueryCache();

  return useMutation({
    mutationFn: (payload: {
      title: string;
      content: string;
      thread_id: number;
      publication_date?: string;
      expiration_date?: string;
      is_headline?: boolean;
    }) => infoService.createDraft(payload),
    onMutate: async (payload) => {
      updateStatsQueryCache(payload.thread_id, InfoStatus.DRAFT, 1);
    },
    onSuccess: async (_, { thread_id }) => {
      const queryKeyThread = infoQueryKeys.byThread({
        status: InfoStatus.DRAFT,
        threadId: thread_id,
      });
      invalidateQueriesWithFirstPage(queryClient, { queryKey: queryKeyThread });

      const queryKeyAllThreads = infoQueryKeys.byThread({
        status: InfoStatus.DRAFT,
        threadId: 'all',
      });
      invalidateQueriesWithFirstPage(queryClient, {
        queryKey: queryKeyAllThreads,
      });
    },
  });
};

export const useUpdateInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
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
    onSuccess: async () => {
      invalidateQueriesWithFirstPage(queryClient, {
        queryKey: infoQueryKeys.all(),
      });
      console.log('invalidate all');
      // invalidateQueriesWithFirstPage(queryClient, {
      //   queryKey: infoQueryKeys.byThread({ threadId: 'all' }),
      // });
      // console.log('infoQueryKeys.stats');
      // setTimeout(() => {

      // }, 5000);
      // console.log('ok');
      queryClient.invalidateQueries({
        queryKey: infoQueryKeys.stats(),
      });
    },
  });
};

export const useDeleteInfo = () => {
  return useMutation({
    mutationFn: ({
      threadId,
      infoId,
    }: {
      threadId: ThreadId;
      infoId: InfoId;
    }) => infoService.delete(threadId, infoId),
  });
};
export const useIncrementInfoViews = (infoId: InfoId) => {
  const queryClient = useQueryClient();
  const { updateViewsCounterByInfoId, viewsCounterByInfoId } =
    useInfoAudienceStore();

  const oldCounter = viewsCounterByInfoId?.[infoId] ?? 0;

  return useMutation({
    mutationFn: () => infoService.incrementViews(infoId),
    onMutate: () => {
      updateViewsCounterByInfoId({ [infoId]: oldCounter + 1 });
    },
    onError: () => {
      updateViewsCounterByInfoId({ [infoId]: oldCounter - 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: infoQueryKeys.viewsDetails({ infoId }),
      });
    },
  });
};
