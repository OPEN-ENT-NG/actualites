import { Menu } from '@edifice.io/react';
import { useNavigate } from 'react-router-dom';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { Thread } from '~/models/thread';
import { ThreadIcon } from '../../../components/ThreadIcon';

export const DesktopMenuThread = ({ thread }: { thread: Thread }) => {
  const { threadId } = useThreadInfoParams();
  const title = thread?.title || '';
  const navigate = useNavigate();

  const handleThreadClick = () => {
    navigate(`/threads/${thread.id}`);
  };

  const selected = threadId === thread.id;

  return (
    <Menu.Item>
      <Menu.Button
        onClick={handleThreadClick}
        selected={selected}
        className="thread-list-menu-btn"
        size="lg"
        leftIcon={<ThreadIcon thread={thread} iconSize="40" />}
      >
        {title}
      </Menu.Button>
    </Menu.Item>
  );
};
