import { ButtonSkeleton, Flex, Menu } from '@edifice.io/react';
import { IconBulletList } from '@edifice.io/react/icons';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '~/hooks/useI18n';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { useThreads } from '~/services/queries';
import './ThreadListDesktop.css';
import { ThreadListDesktopThread } from './ThreadListDesktopThread';

export const ThreadListDesktop = () => {
  const { t } = useI18n();
  const { threadId } = useThreadInfoParams();
  const { data: threads, isLoading, isFetched } = useThreads();
  const navigate = useNavigate();

  const handleAllThreadsClick = () => {
    navigate('/');
  };

  return (
    <Flex
      direction="column"
      gap="8"
      className="overflow-auto py-16 pe-16 col-3 border-end"
    >
      {!isFetched ? (
        <ButtonSkeleton size="lg" className="col-12" />
      ) : (
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
