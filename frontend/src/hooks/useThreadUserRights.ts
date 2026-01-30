import { useUser } from '@edifice.io/react';
import { ThreadId } from '~/models/thread';
import { getThreadUserRights } from '../utils/getThreadUserRights';
import { useThread } from './useThread';

export function useThreadUserRights(threadId: ThreadId) {
  const thread = useThread(threadId);
  const { user } = useUser();
  const userRights = getThreadUserRights(thread, user?.userId);
  return userRights;
}
