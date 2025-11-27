import { invalidateQueriesWithFirstPage, useToast } from '@edifice.io/react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '~/hooks/useI18n';
import { InfoId, InfoStatus } from '~/models/info';
import { infoQueryKeys, useUpdateInfo } from '~/services/queries';

export function useInfoSharesForm({ infoId }: { infoId: InfoId }) {
  const { t } = useI18n();
  const toast = useToast();
  const { mutate: updateInfoMutate } = useUpdateInfo();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handlePublish = () => {
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
          invalidateQueriesWithFirstPage(queryClient, {
            queryKey: infoQueryKeys.all({}),
          });
          toast.success(t('actualites.info.createForm.publishedSuccess'));
          navigate('/');
        },
      },
    );
  };

  return {
    handlePublish,
  };
}
