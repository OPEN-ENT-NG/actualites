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

  const publishOrSubmit = (info: InfoDetails, canPublish: boolean) => {
    if (!info.id) {
      throw new Error('infoId is undefined');
    }

    updateInfoMutate(
      {
        infoId: info.id,
        infoStatus: canPublish ? InfoStatus.PUBLISHED : InfoStatus.PENDING,
        payload: {},
      },
      {
        onSuccess: () => {
          toast.success(
            t(
              canPublish
                ? 'actualites.info.createForm.publishedSuccess'
                : 'actualites.info.createForm.pendingSuccess',
              { threadName: info.thread.title },
            ),
          );
          updateStatsQueryCache(
            info.thread.id,
            canPublish ? InfoStatus.PUBLISHED : InfoStatus.PENDING,
            1,
          );
          updateStatsQueryCache(info.thread.id, InfoStatus.DRAFT, -1);
          invalidateQueriesWithFirstPage(queryClient, {
            queryKey: infoQueryKeys.byThread({
              threadId: info.thread.id,
              status: canPublish ? InfoStatus.PUBLISHED : InfoStatus.PENDING,
            }),
          });
          invalidateQueriesWithFirstPage(queryClient, {
            queryKey: infoQueryKeys.byThread({
              threadId: 'all',
              status: canPublish ? InfoStatus.PUBLISHED : InfoStatus.PENDING,
            }),
          });
          navigate(`/threads/?status=${canPublish ? 'published' : 'pending'}`);
        },
      },
    );
  };

  return {
    publishOrSubmit,
  };
}
