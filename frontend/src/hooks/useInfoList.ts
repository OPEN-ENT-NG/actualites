import { useMemo } from 'react';
import { InfoExtendedStatus, InfoStatus } from '~/models/info';
import { useInfos } from '~/services/queries/info';
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

  // Required for optimistic-update to work
  const infos = useMemo(
    () => infosQuery.data?.pages.flat() || [],
    [infosQuery.data],
  );

  return {
    infos,
    hasNextPage: infosQuery.hasNextPage,
    loadNextPage: () => infosQuery.fetchNextPage(),
    isLoading: infosQuery.isLoading,
  };
}
