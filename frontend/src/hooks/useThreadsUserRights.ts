import { useUser } from '@edifice.io/react';
import { useMemo } from 'react';
import { Thread, ThreadId } from '~/models/thread';
import { useThreads } from '~/services/queries';
import { useUserRights } from './useUserRights';
import { getThreadUserRights } from './utils/threads';

/**
 * Custom hook that filters threads based on the user's contribute rights.
 *
 * @returns An object containing:
 * - `threadsWithContributeRight`: Array of threads where the current user has contribute rights, or undefined if not ready
 * - `canContributeOnOneThread`: Boolean indicating if the user can contribute to at least one thread, or undefined if not ready
 * - `isReady`: Boolean indicating if the hook has finished loading and the data is available
 *
 * @example
 * ```tsx
 * const { threadsWithContributeRight, canContributeOnOneThread, isReady } = useThreadsUserRights();
 *
 * if (isReady && canContributeOnOneThread) {
 *   // User can contribute to at least one thread
 * }
 * ```
 */
export function useThreadsUserRights(): {
  threadsWithContributeRight?: Thread[];
  threadsWithManageRight?: Thread[];
  canContributeOnOneThread?: boolean;
  canManageOnOneThread?: boolean;
  isReady: boolean;
  hasContributeRightOnThread?: (threadId?: ThreadId) => boolean;
} {
  const { data: threads, isSuccess } = useThreads();
  const { user } = useUser();
  const { canCreateThread } = useUserRights();

  return useMemo(() => {
    if (!isSuccess || !threads || !user?.userId) {
      return {
        threadsWithContributeRight: undefined,
        canContributeOnOneThread: undefined,
        isReady: false,
        hasContributeRightOnThread: undefined,
      };
    }

    const threadsWithContributeRight = threads.filter(
      (thread) => getThreadUserRights(thread, user.userId)?.canContribute,
    );
    const canContributeOnOneThread: boolean =
      threadsWithContributeRight.length > 0;

    const hasContributeRightOnThread = (threadId?: ThreadId) => {
      return !threadId
        ? canContributeOnOneThread
        : !canContributeOnOneThread
          ? false
          : threadsWithContributeRight.some((thread) => thread.id === threadId);
    };

    const threadsWithManageRight = threads.filter(
      (thread) => getThreadUserRights(thread, user.userId)?.canManage,
    );

    return {
      isReady: true,
      threadsWithContributeRight,
      threadsWithManageRight,
      canContributeOnOneThread,
      canManageOnOneThread:
        threadsWithManageRight.length > 0 || canCreateThread,
      hasContributeRightOnThread,
    };
  }, [threads, user?.userId, isSuccess]);
}
