import { useMemo } from 'react';
import { ThreadId } from '~/models/thread';
import { useThreads } from '~/services/queries/thread';

export function useThread(threadId?: ThreadId) {
  const threads = useThreads();

  const thread = useMemo(() => {
    if (!threadId) return undefined;
    return threads?.data?.find((thread) => thread._id === threadId);
  }, [threads.data, threadId]);

  return thread;
}
