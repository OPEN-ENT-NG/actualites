import { useToast } from '@edifice.io/react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { INFO_DATES_RESET_VALUES, INFO_HOURS_DATE_DEFAULT } from '~/features';
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

      const getExpirationDate = (
        updateDate: Date,
        creationDate: Date,
        expirationDate: string | undefined,
      ): Date => {
        if (!expirationDate) {
          return INFO_DATES_RESET_VALUES.expirationDate;
        }
        const updateDateCopy = new Date(updateDate);
        updateDateCopy.setFullYear(updateDateCopy.getFullYear() + 1);
        updateDateCopy.setHours(INFO_HOURS_DATE_DEFAULT, 0, 0, 0);
        const creationDateCopy = new Date(creationDate);
        creationDateCopy.setFullYear(creationDateCopy.getFullYear() + 1);
        creationDateCopy.setHours(INFO_HOURS_DATE_DEFAULT, 0, 0, 0);

        const expDate = new Date(expirationDate);
        // If the expiration date is before the update date or creation date, that mean user set a custom expiration date, we should keep it. Otherwise, we reset it to the default value.
        if (
          expDate.getTime() < updateDateCopy.getTime() ||
          expDate.getTime() < creationDateCopy.getTime()
        ) {
          return expDate;
        }
        return INFO_DATES_RESET_VALUES.expirationDate;
      };

      payload.expiration_date = getExpirationDate(
        new Date(info.modified),
        new Date(info.created),
        info.expirationDate,
      ).toISOString();
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
