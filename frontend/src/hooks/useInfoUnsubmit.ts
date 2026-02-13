import { useToast } from '@edifice.io/react';
import { useState } from 'react';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetails, InfoStatus } from '~/models/info';
import { invalidateThreadQueries, useUpdateInfo } from '~/services/queries';
import { useUpdateStatsQueryCache } from '~/services/queries/hooks/useUpdateStatsQueryCache';
import { useQueryClient } from '@tanstack/react-query';
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
          console.log('UNSUBMIT');
          updateStatsQueryCache(thread.id, InfoStatus.DRAFT, 1);
          updateStatsQueryCache(thread.id, InfoStatus.PENDING, -1);

          //TODO optimize invalidation on specifics status PENDING and PUBLISHED (not possible with the current implementation)
          invalidateThreadQueries(queryClient, {
            threadId: thread.id,
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
