import { ButtonSkeleton, Dropdown } from '@edifice.io/react';
import { IconBulletList } from '@edifice.io/react/icons';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import { ThreadIcon } from '~/components/ThreadIcon';
import { useI18n } from '~/hooks/useI18n';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { Thread } from '~/models/thread';
import { useThreads } from '~/services/queries';

export const MobileMenu = () => {
  const { t } = useI18n();
  const { data: threads, isFetched } = useThreads();
  const { threadId } = useThreadInfoParams();

  const threadSelected = threads?.find((t) => t.id === threadId);
  const navigate = useNavigate();

  const handleAllThreadsClick = () => {
    navigate('/');
  };

  const handleThreadClick = (thread: Thread) => {
    navigate(`/threads/${thread.id}`);
  };

  if (!isFetched) {
    return <ButtonSkeleton size="lg" className="col-12" />;
  }

  if (!threads) {
    return <></>;
  }

  return (
    <div className="position-relative mx-n16 p-16 border-bottom bg-gray-200">
      <Dropdown block>
        <Dropdown.Trigger
          label={
            (threadSelected && threadSelected.title) ||
            t('actualites.threadList.allThreads')
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
    </div>
  );
};
