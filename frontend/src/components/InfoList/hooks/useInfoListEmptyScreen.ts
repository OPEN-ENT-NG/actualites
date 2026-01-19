import { useInfoSearchParams } from '~/hooks/useInfoListParams';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { useUserRights } from '~/hooks/useUserRights';
import { InfoStatus } from '~/models/info';
import { useThreads } from '~/services/queries';

export type EmptyScreenType =
  | 'pending'
  | 'draft'
  | 'create-thread'
  | 'create-info'
  | 'default';

export function useInfoListEmptyScreen(): {
  type: EmptyScreenType;
  isReady: boolean;
} {
  const { data: threads, isSuccess: isThreadsSuccess } = useThreads();
  const rights = useUserRights();
  const { threadId } = useThreadInfoParams();
  const { value: infoSearchValue } = useInfoSearchParams();

  const {
    canContributeOnOneThread,
    isReady: isThreadsUserRightsReady,
    threadsWithContributeRight,
  } = useThreadsUserRights();

  if (infoSearchValue === InfoStatus.PENDING) {
    return { type: 'pending', isReady: true };
  }

  if (infoSearchValue === InfoStatus.DRAFT) {
    return { type: 'draft', isReady: true };
  }

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
