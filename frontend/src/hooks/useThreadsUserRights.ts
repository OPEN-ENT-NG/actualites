import { useUser } from '@edifice.io/react';
import { useMemo } from 'react';
import { useThreads } from '~/services/queries';
import { getThreadUserRights } from './utils/threads';

const defaultThreadsUserRights = {
  canContributeOnOneThread: false,
};
type ThreadsUserRights = typeof defaultThreadsUserRights;

export function useThreadsUserRights(): ThreadsUserRights {
  const { data: threads } = useThreads();
  const { user } = useUser();

  const canContributeOnOneThread = useMemo(() => {
    return threads?.some(
      (thread) => getThreadUserRights(thread, user?.userId)?.canContribute,
    );
  }, [threads, user?.userId]);

  return {
    canContributeOnOneThread: canContributeOnOneThread ?? false,
  };
}
