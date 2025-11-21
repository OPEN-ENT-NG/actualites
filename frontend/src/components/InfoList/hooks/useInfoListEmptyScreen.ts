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
    if (threads?.length === 0 && rights.canCreateThread) {
      type = 'create-thread';
    } else if (canContributeOnOneThread) {
      if (
        !threadId || // when filter on all threads (path: root/)
        threadsWithContributeRight?.some((thread) => thread.id === threadId) // when filter on a specific thread (path: root/[threadId]/)
      ) {
        type = 'create-info';
      }
    }
  }

  return { type, isReady };
}
