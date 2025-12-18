import { invalidateQueriesWithFirstPage, useToast } from '@edifice.io/react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '~/hooks/useI18n';
import { InfoId, InfoStatus } from '~/models/info';
import { ThreadId } from '~/models/thread';
import { infoQueryKeys, useUpdateInfo } from '~/services/queries';

export function useInfoSharesForm() {
  const { t } = useI18n();
  const toast = useToast();
  const { mutate: updateInfoMutate } = useUpdateInfo();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handlePublish = (infoId: InfoId, threadId: ThreadId) => {
    if (!infoId) {
      throw new Error('infoId is undefined');
    }

    updateInfoMutate(
      {
        infoId: infoId,
        infoStatus: InfoStatus.PUBLISHED,
        payload: {},
      },
      {
        onSuccess: () => {
          //TODO : optimize this invalidation, only invalidate the threads query
          invalidateQueriesWithFirstPage(queryClient, {
            queryKey: infoQueryKeys.all({}),
          });
          toast.success(t('actualites.info.createForm.publishedSuccess'));
          navigate(`/threads/${threadId}?status=draft`);
        },
      },
    );
  };

  return {
    handlePublish,
  };
}
