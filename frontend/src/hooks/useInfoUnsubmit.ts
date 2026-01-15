import { invalidateQueriesWithFirstPage, useToast } from '@edifice.io/react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetails, InfoStatus } from '~/models/info';
import { infoQueryKeys, useUpdateInfo } from '~/services/queries';
import { useUpdateStatsQueryCache } from '~/services/queries/hooks/useUpdateStatsQueryCache';

export function useInfoUnsubmit() {
  const { t } = useI18n();
  const toast = useToast();
  const { mutate: updateInfoMutate } = useUpdateInfo();
  const { updateStatsQueryCache } = useUpdateStatsQueryCache();
  const [isUnsubmitAlertOpen, setUnsubmitAlertOpen] = useState(false);

  const queryClient = useQueryClient();

  const unsubmit = ({ id, thread }: InfoDetails) => {
    updateInfoMutate(
      {
        infoId: id,
        infoStatus: InfoStatus.DRAFT,
        payload: {},
      },
      {
        onError(error) {
          toast.error(
            `${t('actualites.info.unsubmit.error')}\n\n${error.message}`,
          );
        },
        onSuccess() {
          toast.success(t('actualites.info.unsubmit.success'));
          updateStatsQueryCache(thread.id, InfoStatus.DRAFT, 1);
          updateStatsQueryCache(thread.id, InfoStatus.PENDING, -1);

          invalidateQueriesWithFirstPage(queryClient, {
            queryKey: infoQueryKeys.byThread({
              threadId: thread.id,
              status: InfoStatus.DRAFT,
            }),
          });
          invalidateQueriesWithFirstPage(queryClient, {
            queryKey: infoQueryKeys.byThread({
              threadId: 'all',
              status: InfoStatus.DRAFT,
            }),
          });
        },
      },
    );
  };

  return {
    isUnsubmitAlertOpen,
    handleUnsubmitAlertOpen: () => setUnsubmitAlertOpen(true),
    handleUnsubmitAlertClose: () => setUnsubmitAlertOpen(false),
    unsubmit,
  };
}
