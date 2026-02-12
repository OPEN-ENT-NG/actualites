import { useToast } from '@edifice.io/react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetails, InfoStatus } from '~/models/info';
import { invalidateThreadQueries, useUpdateInfo } from '~/services/queries';
import { useUpdateStatsQueryCache } from '~/services/queries/hooks/useUpdateStatsQueryCache';

export function useInfoUnpublish() {
  const { t } = useI18n();
  const toast = useToast();
  const { mutate: updateInfoMutate } = useUpdateInfo();
  const { updateStatsQueryCache } = useUpdateStatsQueryCache();
  const [isUnpublishAlertOpen, setUnpublishAlertOpen] = useState(false);
  const queryClient = useQueryClient();
  const unpublish = ({ id, thread }: InfoDetails) => {
    updateInfoMutate(
      {
        infoId: id,
        infoStatus: InfoStatus.PENDING,
        payload: {},
      },
      {
        onError(error) {
          toast.error(
            `${t('actualites.info.unpublish.error')}\n\n${error.message}`,
          );
        },
        onSuccess() {
          toast.success(t('actualites.info.unpublish.success'));
          updateStatsQueryCache(thread.id, InfoStatus.PENDING, 1);
          updateStatsQueryCache(thread.id, InfoStatus.PUBLISHED, -1);

          invalidateThreadQueries(queryClient, {
            threadId: thread.id,
            status: InfoStatus.PENDING,
          });
          invalidateThreadQueries(queryClient, {
            threadId: thread.id,
            status: InfoStatus.PUBLISHED,
          });
        },
      },
    );
  };

  return {
    isUnpublishAlertOpen,
    handleUnpublishAlertOpen: () => setUnpublishAlertOpen(true),
    handleUnpublishAlertClose: () => setUnpublishAlertOpen(false),
    unpublish,
  };
}
