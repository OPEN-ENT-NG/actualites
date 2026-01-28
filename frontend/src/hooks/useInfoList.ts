import { useEffect, useMemo } from 'react';
import { InfoExtendedStatus, InfoStatus } from '~/models/info';
import { infoService } from '~/services';
import { useInfos } from '~/services/queries/info';
import { useInfoAudienceStore } from '~/store/audienceStore';
import { useInfoSearchParams } from './useInfoSearchParams';
import { useThreadInfoParams } from './useThreadInfoParams';

export function useInfoList() {
  const { threadId } = useThreadInfoParams();
  const { value } = useInfoSearchParams();
  const { updateViewsCounterByInfoId } = useInfoAudienceStore();

  // Convert value to status and state for the API
  const status = Object.values(InfoStatus).includes(value as InfoStatus)
    ? (value as InfoStatus)
    : undefined;
  const state = Object.values(InfoExtendedStatus).includes(
    value as InfoExtendedStatus,
  )
    ? (value as InfoExtendedStatus)
    : undefined;

  const { data, hasNextPage, fetchNextPage, isLoading } = useInfos(threadId, {
    status,
    state,
  });

  useEffect(() => {
    // Load views counters of the latest page, and update the views store
    async function load() {
      if (data && data.pages.length > 0) {
        const latestPage = data.pages[data.pages.length - 1];
        try {
          const viewsCounters = await infoService.getViewsCounters(
            latestPage.map((info) => info.id),
          );
          updateViewsCounterByInfoId(viewsCounters);
        } catch {
          // Fallback : update nothing
        }
      }
    }

    load();
  }, [data, updateViewsCounterByInfoId]);

  // Required for optimistic-update to work
  const infos = useMemo(() => data?.pages.flat() || [], [data]);

  return {
    infos,
    hasNextPage: hasNextPage,
    loadNextPage: () => fetchNextPage(),
    isLoading: isLoading,
  };
}
