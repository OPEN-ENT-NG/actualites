import { Button, Flex } from '@edifice.io/react';
import { IconArrowLeft } from '@edifice.io/react/icons';
import { QueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ThreadsSettingList, ThreadsSettingListSkeleton } from '~/features';
import { useI18n } from '~/hooks/useI18n';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { threadQueryOptions, useThreads } from '~/services/queries';

export const loader = (queryClient: QueryClient) => async () => {
  const queryThreads = threadQueryOptions.getThreads(true);

  queryClient.ensureQueryData(queryThreads);
  return null;
};

export function ThreadsSetting() {
  const { isPending } = useThreads(true);
  const { t } = useI18n();
  const navigate = useNavigate();
  const { canManageOnOneThread } = useThreadsUserRights(true);

  if (canManageOnOneThread !== undefined && !canManageOnOneThread) {
    throw new Error(t('actualites.adminThreads.accessDenied'));
  }

  const handleGoBackClick = () => {
    navigate('/');
  };

  if (isPending) {
    return <ThreadsSettingListSkeleton />;
  }
  return (
    <Flex direction="column" align="start" fill>
      <Button
        data-testid="thread-setting-goback-button"
        variant="ghost"
        color="tertiary"
        onClick={handleGoBackClick}
        leftIcon={<IconArrowLeft />}
        className="my-16"
      >
        {t('actualites.adminThreads.goBack')}
      </Button>
      <ThreadsSettingList />
    </Flex>
  );
}
