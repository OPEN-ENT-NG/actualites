import { Button, ButtonSkeleton, Flex, Menu } from '@edifice.io/react';
import { IconBulletList, IconSettings } from '@edifice.io/react/icons';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '~/hooks/useI18n';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { useUserRights } from '~/hooks/useUserRights';
import { useThreads } from '~/services/queries';
import './ThreadListDesktop.css';
import { ThreadListDesktopThread } from './ThreadListDesktopThread';

export const ThreadListDesktop = () => {
  const { t } = useI18n();
  const { threadId } = useThreadInfoParams();
  const { data: threads, isLoading, isFetched } = useThreads();
  const navigate = useNavigate();

  const { canCreateThread } = useUserRights();
  const { canManageOnOneThread } = useThreadsUserRights();

  const handleAllThreadsClick = () => {
    navigate('/');
  };

  const handleManageThreadsClick = () => {
    navigate('/admin/threads');
  };

  return (
    <Flex direction="column" fill gap="8" className="overflow-auto py-16 pe-16">
      {!isFetched ? (
        <ButtonSkeleton size="lg" className="col-12" />
      ) : (
        <>
          <Menu label="threadlist">
            <Menu.Item key="all-threads">
              <Menu.Button
                onClick={handleAllThreadsClick}
                selected={!threadId}
                className="thread-list-menu-btn"
                size="lg"
                leftIcon={<IconBulletList width={24} height={24} />}
              >
                {t('actualites.threadList.allThreads')}
              </Menu.Button>
            </Menu.Item>
            {threads?.map((thread) => (
              <ThreadListDesktopThread thread={thread} key={thread.id} />
            ))}
          </Menu>
          {(canCreateThread || canManageOnOneThread) && (
            <Button
              color="secondary"
              leftIcon={<IconSettings />}
              variant="outline"
              onClick={handleManageThreadsClick}
            >
              {t('actualites.threadList.manageThreads')}
            </Button>
          )}
        </>
      )}
      {isLoading && (
        <>
          <ButtonSkeleton size="lg" className="col-12" />
          <ButtonSkeleton size="lg" className="col-12" />
          <ButtonSkeleton size="lg" className="col-12" />
        </>
      )}
    </Flex>
  );
};
