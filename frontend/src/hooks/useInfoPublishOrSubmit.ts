import { invalidateQueriesWithFirstPage, useToast } from '@edifice.io/react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetails, InfoStatus } from '~/models/info';
import { infoQueryKeys, useUpdateInfo } from '~/services/queries';
import { useUpdateStatsQueryCache } from '~/services/queries/hooks/useUpdateStatsQueryCache';

export function useInfoPublishOrSubmit() {
  const { t } = useI18n();
  const toast = useToast();
  const { mutate: updateInfoMutate } = useUpdateInfo();
  const navigate = useNavigate();
  const { updateStatsQueryCache } = useUpdateStatsQueryCache();

  const queryClient = useQueryClient();

  const publishOrSubmit = (
    info: InfoDetails,
    status: InfoStatus.PUBLISHED | InfoStatus.PENDING,
  ) => {
    if (!info.id) {
      throw new Error('infoId is undefined');
    }

    updateInfoMutate(
      {
        infoId: info.id,
        infoStatus: status,
        payload: {},
      },
      {
        onSuccess: () => {
          toast.success(
            t(
              status === InfoStatus.PUBLISHED
                ? 'actualites.info.createForm.publishedSuccess'
                : 'actualites.info.createForm.pendingSuccess',
              { threadName: info.thread.title },
            ),
          );
          updateStatsQueryCache(info.thread.id, status, 1);
          updateStatsQueryCache(info.thread.id, info.status, -1);
          invalidateQueriesWithFirstPage(queryClient, {
            queryKey: infoQueryKeys.byThread({
              threadId: info.thread.id,
              status,
            }),
          });
          invalidateQueriesWithFirstPage(queryClient, {
            queryKey: infoQueryKeys.byThread({
              threadId: 'all',
              status,
            }),
          });
          navigate(
            `/?status=${status === InfoStatus.PUBLISHED ? 'published' : 'pending'}`,
          );
        },
      },
    );
  };

  return {
    publishOrSubmit,
  };
}
