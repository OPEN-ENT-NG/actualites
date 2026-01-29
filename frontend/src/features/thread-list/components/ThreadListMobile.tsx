import {
  Button,
  ButtonSkeleton,
  Divider,
  Dropdown,
  Flex,
  useBreakpoint,
} from '@edifice.io/react';
import {
  IconAdjustSettings,
  IconBulletList,
  IconSettings,
} from '@edifice.io/react/icons';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import { ThreadIcon } from '~/components/ThreadIcon';
import { useI18n } from '~/hooks/useI18n';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { Thread } from '~/models/thread';
import { useThreads } from '~/services/queries';
import { useUserRights } from '~/store/rights/resource';

export const ThreadListMobile = () => {
  const { t } = useI18n();
  const { data: threads, isFetched } = useThreads();
  const { threadId } = useThreadInfoParams();

  const threadSelected = threads?.find((t) => t.id === threadId);
  const navigate = useNavigate();
  const { canManageOnOneThread } = useThreadsUserRights();
  const { canParamThreads } = useUserRights();
  const { md } = useBreakpoint();

  const handleAllThreadsClick = () => {
    navigate('/');
  };

  const handleThreadClick = (thread: Thread) => {
    navigate(`/threads/${thread.id}`);
  };

  const handleManageThreadsClick = () => {
    navigate('/threads/admin');
  };

  const handleParamThreadsClick = () => {
    navigate('/threads/settings');
  };

  if (!isFetched) {
    return <ButtonSkeleton size="lg" className="col-12" />;
  }

  if (!threads) {
    return null;
  }

  return (
    <Flex
      direction={md ? 'row' : 'column'}
      gap={md ? '24' : '0'}
      className="position-relative mx-n16 py-16 px-0 px-md-16 border-bottom"
    >
      <Flex className="px-16 px-md-0" fill>
        <Dropdown block>
          <Dropdown.Trigger
            label={
              threadSelected?.title || t('actualites.threadList.allThreads')
            }
            icon={
              threadSelected ? (
                <ThreadIcon thread={threadSelected} />
              ) : (
                <IconBulletList width={24} height={24} />
              )
            }
          />
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => handleAllThreadsClick()}
              key={'all-threads'}
              icon={<IconBulletList width={24} height={24} className="m-4" />}
            >
              {t('actualites.threadList.allThreads')}
            </Dropdown.Item>
            {threads.map((thread) => (
              <Dropdown.Item
                onClick={() => handleThreadClick(thread)}
                key={thread.id}
                className={clsx({
                  'bg-secondary-200': thread.id === threadSelected?.id,
                })}
                icon={<ThreadIcon thread={thread} />}
              >
                {thread.title}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Flex>
      {(canManageOnOneThread || canParamThreads) && (
        <>
          {!md && <Divider className="my-16" />}
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
      )}
    </Flex>
  );
};
