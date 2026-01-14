import { useEdificeClient } from '@edifice.io/react';
import { Info, InfoStatus } from '~/models/info';
import { useThread } from './useThread';
import { getThreadUserRights } from './utils/threads';

export function useInfoActionDropdown(info: Info) {
  const { user } = useEdificeClient();
  const thread = useThread(info.threadId);
  const {
    canContribute,
    canPublish: canPublishInThread,
    canManage,
  } = getThreadUserRights(thread, user?.userId || '');

  const isOwner = info.owner.id === user?.userId;
  const isDraft = info.status === InfoStatus.DRAFT;

  const canSubmit = isDraft && canContribute;

  const canPublish =
    (isDraft || info.status === InfoStatus.PENDING) && canPublishInThread;

  const canEdit =
    (isDraft && info.owner.id === user?.userId) ||
    (info.status === InfoStatus.PENDING &&
      (info.owner.id === user?.userId || canPublish || canManage)) ||
    (info.status === InfoStatus.PUBLISHED && (canPublish || canManage));

  const canUnpublish =
    info.status === InfoStatus.PUBLISHED &&
    ((canContribute && info.owner.id === user?.userId) ||
      canPublish ||
      canManage);

  const canDelete = info.owner.id === user?.userId || canManage || canPublish;

  const canUnsubmit = isOwner && info.status === InfoStatus.PENDING;

  return {
    user,
    thread,
    isOwner,
    isDraft,
    canContribute,
    canDelete,
    canEdit,
    canManage,
    canPublish,
    canPublishInThread,
    canSubmit,
    canUnpublish,
    canUnsubmit,
  };
}
