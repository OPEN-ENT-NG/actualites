import { ButtonSkeleton, Flex, Menu } from '@edifice.io/react';
import { IconBulletList } from '@edifice.io/react/icons';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '~/hooks/useI18n';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { useUserRights } from '~/hooks/useUserRights';
import { useThreads } from '~/services/queries';
import { ThreadListActions } from './ThreadListActions';
import './ThreadListDesktop.css';
import { ThreadListDesktopThread } from './ThreadListDesktopThread';

export const ThreadListDesktop = () => {
  const { t } = useI18n();
  const { threadId } = useThreadInfoParams();
  const { data: threads, isLoading, isFetched } = useThreads();
  const navigate = useNavigate();

  const { canManageOnOneThread } = useThreadsUserRights();
  const { canParamThreads } = useUserRights();

  const handleAllThreadsClick = () => {
    navigate('/');
  };

  console.log('threads in ', canParamThreads || canManageOnOneThread);
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
              <ThreadListActions />
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
