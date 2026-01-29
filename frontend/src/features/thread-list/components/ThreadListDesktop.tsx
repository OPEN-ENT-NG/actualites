import {
  Button,
  ButtonSkeleton,
  Flex,
  Menu,
  useScrollToTop,
} from '@edifice.io/react';
import {
  IconAdjustSettings,
  IconBulletList,
  IconSettings,
} from '@edifice.io/react/icons';
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

  const { canManageOnOneThread } = useThreadsUserRights();
  const { canParamThreads } = useUserRights();

  const scrollToTop = useScrollToTop();

  const handleAllThreadsClick = () => {
    navigate('/');
  };

  const handleManageThreadsClick = () => {
    scrollToTop();
    navigate('/threads/admin');
  };

  const handleParamThreadsClick = () => {
    scrollToTop();
    navigate('/threads/settings');
  };

  return (
    <Flex
      direction="column"
      fill
      gap="4"
      className="threadlist-container overflow-auto pt-16 pe-16 h-100"
    >
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

          {(canManageOnOneThread || canParamThreads) && (
            <Flex
              gap="8"
              direction="column"
              className="border-top py-16 bg-white sticky-bottom z-1"
            >
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
                  data-testid="manage-threads-button"
                  color="secondary"
                  leftIcon={<IconSettings />}
                  variant="outline"
                  onClick={handleManageThreadsClick}
                  className="w-100"
                >
                  {t('actualites.threadList.manageThreads')}
                </Button>
              )}
            </Flex>
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
