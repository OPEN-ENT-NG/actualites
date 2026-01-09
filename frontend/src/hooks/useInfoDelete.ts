import { invalidateQueriesWithFirstPage, useToast } from '@edifice.io/react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetails, InfoStatus } from '~/models/info';
import { infoQueryKeys, useDeleteInfo } from '~/services/queries';
import { useUpdateStatsQueryCache } from '~/services/queries/hooks/useUpdateStatsQueryCache';

export function useInfoDelete() {
  const { t } = useI18n();
  const toast = useToast();
  const { mutate: deleteInfoMutate } = useDeleteInfo();
  const { updateStatsQueryCache } = useUpdateStatsQueryCache();
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const queryClient = useQueryClient();

  const trash = ({ id, thread }: InfoDetails) => {
    deleteInfoMutate(
      {
        threadId: thread.id,
        infoId: id,
      },
      {
        onError(error) {
          toast.error(
            `${t('actualites.info.delete.error')}\n\n${error.message}`,
          );
        },
        onSuccess() {
          toast.success(t('actualites.info.delete.success'));
          updateStatsQueryCache(thread.id, InfoStatus.PENDING, 1);
          updateStatsQueryCache(thread.id, InfoStatus.PUBLISHED, -1);

          invalidateQueriesWithFirstPage(queryClient, {
            queryKey: infoQueryKeys.byThread({
              threadId: thread.id,
              status: InfoStatus.PENDING,
            }),
          });
          invalidateQueriesWithFirstPage(queryClient, {
            queryKey: infoQueryKeys.byThread({
              threadId: 'all',
              status: InfoStatus.PENDING,
            }),
          });
        },
      },
    );
  };

  return {
    isDeleteAlertOpen,
    handleDeleteAlertOpen: () => setDeleteAlertOpen(true),
    handleDeleteAlertClose: () => setDeleteAlertOpen(false),
    trash,
  };
}
