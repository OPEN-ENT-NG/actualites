import { invalidateQueriesWithFirstPage } from '@edifice.io/react';
import { queryClient } from '~/providers';
import { InfoExtendedStatus, InfoStatus } from '~/models/info';
import { infoQueryKeys, useInfos } from '~/services/queries/info';
import { useInfoSearchParams } from './useInfoSearchParams';
import { useThreadInfoParams } from './useThreadInfoParams';

export function useInfoList() {
  const { threadId } = useThreadInfoParams();
  const { value } = useInfoSearchParams();
  // Convert value to status and state for the API
  const status = Object.values(InfoStatus).includes(value as InfoStatus)
    ? (value as InfoStatus)
    : undefined;
  const state = Object.values(InfoExtendedStatus).includes(
    value as InfoExtendedStatus,
  )
    ? (value as InfoExtendedStatus)
    : undefined;

  const infosQuery = useInfos(threadId, { status, state });

  return {
    infos: infosQuery.data?.pages.flatMap((page) => page) || [],
    hasNextPage: infosQuery.hasNextPage,
    loadNextPage: () => infosQuery.fetchNextPage(),
    isLoading: infosQuery.isLoading,
    reload: () => {
      invalidateQueriesWithFirstPage(queryClient, {
        queryKey: infoQueryKeys.infos({ threadId, status, state }),
      });
    },
  };
}
