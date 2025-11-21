import {
  THREAD_CONTRIBUTOR,
  THREAD_MANAGER,
  THREAD_PUBLISHER,
} from '~/config/rights';
import { Thread } from '~/models/thread';

type ThreadUserRights = {
  canContribute: boolean;
  canPublish: boolean;
  canManage: boolean;
};

export function getThreadUserRights(
  thread?: Thread,
  userId?: string,
): ThreadUserRights {
  if (!thread || !userId || !thread.sharedRights?.length) {
    return { canContribute: false, canPublish: false, canManage: false };
  }

  return thread.sharedRights.reduce(
    (rights, right) => {
      switch (right) {
        case THREAD_MANAGER:
          rights.canManage = true;
          break;
        case THREAD_CONTRIBUTOR:
          rights.canContribute = true;
          break;
        case THREAD_PUBLISHER:
          rights.canPublish = true;
          break;
      }
      return rights;
    },
    {
      canContribute: false,
      canPublish: false,
      canManage: false,
    } as ThreadUserRights,
  );
}
