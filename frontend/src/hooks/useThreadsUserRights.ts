import { useUser } from '@edifice.io/react';
import { useMemo } from 'react';
import { useThreads } from '~/services/queries';
import { getThreadUserRights } from './utils/threads';

type ThreadsUserRights = {
  canContributeOnOneThread: boolean | undefined;
  isSuccess: boolean;
};
export function useThreadsUserRights(): ThreadsUserRights {
  const { data: threads, isSuccess } = useThreads();
  const { user } = useUser();

  const canContributeOnOneThread = useMemo(() => {
    return threads?.some(
      (thread) => getThreadUserRights(thread, user?.userId)?.canContribute,
    );
  }, [threads, user?.userId, isSuccess]);

  return {
    canContributeOnOneThread,
    isSuccess,
  };
}
