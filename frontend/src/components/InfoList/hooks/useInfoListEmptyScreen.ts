import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { useUserRights } from '~/hooks/useUserRights';
import { useThreads } from '~/services/queries';

type EmptyScreenType = 'create-thread' | 'create-info' | 'default';

export function useInfoListEmptyScreen(): EmptyScreenType {
  const { data: threads } = useThreads();
  const rights = useUserRights();
  const threadsRights = useThreadsUserRights();
  const shouldCreateThread = threads?.length === 0 && rights.canCreateThread;
  if (shouldCreateThread) return 'create-thread';
  if (threadsRights.canContributeOnOneThread) {
    return 'create-info';
  }
  return 'default';
}
