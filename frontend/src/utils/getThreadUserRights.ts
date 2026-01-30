import {
  THREAD_CONTRIBUTOR,
  THREAD_MANAGER,
  THREAD_PUBLISHER,
} from '~/config/rights';
import { Thread } from '~/models/thread';

type ThreadUserRights = {
  isThreadOwner: boolean;
  canContributeInThread: boolean;
  canPublishInThread: boolean;
  canManageThread: boolean;
};

export function getThreadUserRights(
  thread?: Thread,
  userId?: string,
): ThreadUserRights {
  if (!thread || !userId || !thread.sharedRights?.length) {
    return {
      isThreadOwner: false,
      canContributeInThread: false,
      canPublishInThread: false,
      canManageThread: false,
    };
  }

  return thread.sharedRights.reduce(
    (rights, right) => {
      switch (right) {
        case THREAD_MANAGER:
          rights.canManageThread = true;
          break;
        case THREAD_CONTRIBUTOR:
          rights.canContributeInThread = true;
          break;
        case THREAD_PUBLISHER:
          rights.canPublishInThread = true;
          break;
      }
      return rights;
    },
    {
      isThreadOwner: thread.owner.id === userId,
      canContributeInThread: false,
      canPublishInThread: false,
      canManageThread: false,
    } as ThreadUserRights,
  );
}
