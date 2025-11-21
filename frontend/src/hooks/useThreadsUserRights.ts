import { useUser } from '@edifice.io/react';
import { useMemo } from 'react';
import { useThreads } from '~/services/queries';
import { getThreadUserRights } from './utils/threads';
import { Thread } from '~/models/thread';

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
