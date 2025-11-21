import { useUser } from '@edifice.io/react';
import { ThreadId } from '~/models/thread';
import { useThread } from './useThread';
import { getThreadUserRights } from './utils/threads';

export function useThreadUserRights(threadId: ThreadId) {
  const thread = useThread(threadId);
  const { user } = useUser();
  const userRights = getThreadUserRights(thread, user?.userId);
  return userRights;
}
