import { useToast } from '@edifice.io/react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { INFO_DATES_RESET_VALUES } from '~/features';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetails, InfoStatus, UpdateInfoPayload } from '~/models/info';
import { invalidateThreadQueries, useUpdateInfo } from '~/services/queries';
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
    let payload: UpdateInfoPayload = {};

    if (!info.publicationDate) {
      payload.publication_date =
        INFO_DATES_RESET_VALUES.publicationDate.toISOString();
      payload.expiration_date =
        INFO_DATES_RESET_VALUES.expirationDate.toISOString();
    }
    updateInfoMutate(
      {
        infoId: info.id,
        infoStatus: status,
        payload: payload,
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
          invalidateThreadQueries(queryClient, {
            threadId: info.thread.id,
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
