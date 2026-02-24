import { Button, ButtonSkeleton, useScrollToTop } from '@edifice.io/react';
import { IconAdjustSettings, IconSettings } from '@edifice.io/react/icons';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '~/hooks/useI18n';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { useUserRights } from '~/hooks/useUserRights';
import { useThreads } from '~/services/queries';

export const ThreadListActions = () => {
  const { t } = useI18n();
  const { data: threads, isFetched } = useThreads();

  const navigate = useNavigate();
  const { canManageOnOneThread } = useThreadsUserRights();
  const { canParamThreads } = useUserRights();
  const scrollToTop = useScrollToTop();

  const handleManageThreadsClick = () => {
    scrollToTop();
    navigate('/threads/admin');
  };

  const handleParamThreadsClick = () => {
    scrollToTop();
    navigate('/threads/settings');
  };

  if (!isFetched) {
    return <ButtonSkeleton size="lg" className="col-12" />;
  }

  if (!threads) {
    return null;
  }

  return (
    <>
      {canParamThreads && (
        <Button
          data-testid="param-threads-button"
          color="secondary"
          leftIcon={<IconAdjustSettings />}
          variant="ghost"
          onClick={handleParamThreadsClick}
          className="w-100"
        >
          {t('actualites.threadList.threadSettings')}
        </Button>
      )}
      {canManageOnOneThread && (
        <Button
          color="secondary"
          size="sm"
          leftIcon={<IconSettings />}
          variant="outline"
          onClick={handleManageThreadsClick}
          className="mx-16 mx-md-0"
        >
          {t('actualites.threadList.manageThreads')}
        </Button>
      )}
    </>
  );
};
