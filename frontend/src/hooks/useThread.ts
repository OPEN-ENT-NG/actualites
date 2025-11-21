import { useMemo } from 'react';
import { ThreadId } from '~/models/thread';
import { useThreads } from '~/services/queries/thread';

export function useThread(threadId?: ThreadId) {
  const threads = useThreads();

  const thread = useMemo(() => {
    return threads?.data?.find((thread) => thread.id === threadId);
  }, [threads.data, threadId]);

  return thread;
}
