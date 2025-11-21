import { invalidateQueriesWithFirstPage } from '@edifice.io/react';
import { queryClient } from '~/providers';
import { infoQueryKeys, useInfos } from '~/services/queries/info';
import { useThreadInfoParams } from './useThreadInfoParams';

export function useInfoList() {
  const { threadId } = useThreadInfoParams();

  const infosQuery = useInfos(threadId);

  return {
    infos: infosQuery.data?.pages.flatMap((page) => page) || [],
    hasNextPage: infosQuery.hasNextPage,
    loadNextPage: () => infosQuery.fetchNextPage(),
    isLoading: infosQuery.isLoading,
    reload: () => {
      invalidateQueriesWithFirstPage(queryClient, {
        queryKey: infoQueryKeys.all({ threadId }),
      });
    },
  };
}
