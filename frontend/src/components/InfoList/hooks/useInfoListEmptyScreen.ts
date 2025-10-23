import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { useUserRights } from '~/hooks/useUserRights';
import { useThreads } from '~/services/queries';

export type EmptyScreenType = 'create-thread' | 'create-info' | 'default';

export function useInfoListEmptyScreen(): {
  type: EmptyScreenType;
  isReady: boolean;
} {
  const { data: threads, isSuccess: isThreadsSuccess } = useThreads();
  const rights = useUserRights();
  const { canContributeOnOneThread, isSuccess: isThreadsUserRightsSuccess } =
    useThreadsUserRights();

  const isReady = isThreadsSuccess && isThreadsUserRightsSuccess;
  let type: EmptyScreenType = 'default';

  if (isReady) {
    const shouldCreateThread = threads?.length === 0 && rights.canCreateThread;
    if (shouldCreateThread) type = 'create-thread';
    if (canContributeOnOneThread) {
      type = 'create-info';
    }
  }

  return { type, isReady };
}
