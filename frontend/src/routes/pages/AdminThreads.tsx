import { Button, Flex } from '@edifice.io/react';
import { IconArrowLeft } from '@edifice.io/react/icons';
import { QueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AdminThreadList } from '~/features/admin-threads-list/AdminThreadList';
import { AdminThreadListSkeleton } from '~/features/admin-threads-list/AdminThreadListSkeleton';
import { useI18n } from '~/hooks/useI18n';
import { threadQueryOptions, useThreads } from '~/services/queries';

export const loader = (queryClient: QueryClient) => async () => {
  const queryThreads = threadQueryOptions.getThreads();

  queryClient.ensureQueryData(queryThreads);
  return null;
};

export function AdminThreads() {
  const { isPending } = useThreads();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleGoBackClick = () => {
    navigate(-1);
  };

  if (isPending) {
    return <AdminThreadListSkeleton />;
  }
  return (
    <Flex direction="column" align="start" fill className="col-12">
      <Button
        variant="ghost"
        color="tertiary"
        onClick={handleGoBackClick}
        leftIcon={<IconArrowLeft />}
      >
        {t('actualites.adminThreads.goBack')}
      </Button>
      <AdminThreadList />
    </Flex>
  );
}
