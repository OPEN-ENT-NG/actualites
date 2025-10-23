import { CREATE_DRAFT_RIGHT, PUBLISH_RIGHT } from '~/config/rights';
import { Thread } from '~/models/thread';

const defaultThreadRights = {
  canContribute: false,
  canPublish: false,
};
type ThreadUserRights = typeof defaultThreadRights;

export function getThreadUserRights(
  thread?: Thread,
  userId?: string,
): ThreadUserRights {
  if (!thread || !userId) {
    return defaultThreadRights;
  }

  if (thread.owner === userId) {
    return {
      canContribute: true,
      canPublish: true,
    };
  }

  if (!thread.shared || thread.shared.length === 0) {
    return defaultThreadRights;
  }

  const rights = new Set<string>();

  thread.shared.forEach((rightsGroup) => {
    Object.entries(rightsGroup).forEach(([key, value]) => {
      if (value === true) {
        rights.add(key);
      }
    });
  });

  if (rights.size === 0) {
    return defaultThreadRights;
  }

  const hasRight = (rightName: string) => rights.has(rightName);

  return {
    canContribute: hasRight(CREATE_DRAFT_RIGHT),
    canPublish: hasRight(PUBLISH_RIGHT),
  };
}
