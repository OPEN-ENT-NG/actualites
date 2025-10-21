import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { useUserRights } from '~/hooks/useUserRights';
import { useThreads } from '~/services/queries';

export type EmptyScreenType = 'create-thread' | 'create-info' | 'default';

export function useInfoListEmptyScreen(): {
  type: EmptyScreenType;
  isReady: boolean;
} {
  const { data: threads, isSuccess } = useThreads();
  const rights = useUserRights();
  const threadsRights = useThreadsUserRights();

  const isReady = isSuccess; // Ajoutez d'autres conditions si nécessaire
  let type: EmptyScreenType = 'default';

  if (isReady) {
    const shouldCreateThread = threads?.length === 0 && rights.canCreateThread;
    if (shouldCreateThread) type = 'create-thread';
    if (threadsRights.canContributeOnOneThread) {
      type = 'create-info';
    }
  }

  return { type, isReady };
}
