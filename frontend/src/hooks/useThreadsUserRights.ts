import { useUser } from '@edifice.io/react';
import { useMemo } from 'react';
import { useThreads } from '~/services/queries';
import { getThreadUserRights } from './utils/threads';
import { Thread } from '~/models/thread';

export function useThreadsUserRights(): {
  threadsWithContributeRight: Thread[] | undefined;
  canContributeOnOneThread: boolean | undefined;
  isReady: boolean;
} {
  const { data: threads, isSuccess } = useThreads();
  const { user } = useUser();

  return useMemo(() => {
    if (!isSuccess || !threads || !user?.userId) {
      return {
        threadsWithContributeRight: undefined,
        canContributeOnOneThread: undefined,
        isReady: false,
      };
    }

    const threadsWithRights = threads.filter(
      (thread) => getThreadUserRights(thread, user.userId)?.canContribute,
    );

    return {
      threadsWithContributeRight: threadsWithRights,
      canContributeOnOneThread: threadsWithRights.length > 0,
      isReady: true,
    };
  }, [threads, user?.userId, isSuccess]);
}
