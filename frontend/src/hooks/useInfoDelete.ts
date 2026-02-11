import { invalidateQueriesWithFirstPage, useToast } from '@edifice.io/react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetails, InfoExtendedStatus } from '~/models/info';
import {
  infoQueryKeys,
  InfoQueryKeysParams,
  useDeleteInfo,
} from '~/services/queries';
import { useUpdateStatsQueryCache } from '~/services/queries/hooks/useUpdateStatsQueryCache';
import { useInfoStatus } from './useInfoStatus';

export function useInfoDelete() {
  const { t } = useI18n();
  const toast = useToast();
  const { mutate: deleteInfoMutate } = useDeleteInfo();
  const { updateStatsQueryCache } = useUpdateStatsQueryCache();
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const queryClient = useQueryClient();

  const trash = (info: InfoDetails) => {
    const { isIncoming, isExpired } = useInfoStatus(info);
    const { id, thread, status } = info;
    const state = isIncoming
      ? InfoExtendedStatus.INCOMING
      : isExpired
        ? InfoExtendedStatus.EXPIRED
        : undefined;
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
          updateStatsQueryCache(thread.id, status, -1, state);
          const queryKeyParams: InfoQueryKeysParams = {
            threadId: 'all',
          };
          if (state) {
            queryKeyParams.state = state;
          } else {
            queryKeyParams.status = status;
          }

          invalidateQueriesWithFirstPage(queryClient, {
            queryKey: infoQueryKeys.byThread(queryKeyParams),
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
