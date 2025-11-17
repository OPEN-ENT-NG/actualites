import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
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
  const { threadId } = useThreadInfoParams();

  const {
    canContributeOnOneThread,
    isReady: isThreadsUserRightsReady,
    threadsWithContributeRight,
  } = useThreadsUserRights();

  const isReady = isThreadsSuccess && isThreadsUserRightsReady;
  let type: EmptyScreenType = 'default';

  if (isReady) {
    const shouldCreateThread = threads?.length === 0 && rights.canCreateThread;
    if (shouldCreateThread) type = 'create-thread';

    if (!threadId) {
      if (canContributeOnOneThread) {
        type = 'create-info';
      }
    } else {
      if (
        threadsWithContributeRight?.some((thread) => thread.id === threadId)
      ) {
        type = 'create-info';
      }
    }
  }

  return { type, isReady };
}
