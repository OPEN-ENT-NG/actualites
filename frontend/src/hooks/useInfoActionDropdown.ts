import { useEdificeClient } from '@edifice.io/react';
import { Info } from '~/models/info';
import { getThreadUserRights } from '~/utils/getThreadUserRights';
import { useInfoStatus } from './useInfoStatus';
import { useThread } from './useThread';

export function useInfoActionDropdown(info: Info) {
  const { user } = useEdificeClient();
  const thread = useThread(info.threadId);
  const {
    isThreadOwner,
    canContributeInThread,
    canPublishInThread,
    canManageThread,
  } = getThreadUserRights(thread, user?.userId || '');
  const { isDraft, isPending, isPublished, isExpired } = useInfoStatus(info);

  const isThreadOwnerOrPublisherOrAdmin =
    isThreadOwner || canPublishInThread || canManageThread;
  const isOwner = info.owner.id === user?.userId;

  const canPrint = isPublished;

  const canModifyShare =
    (isPublished && !isExpired && isThreadOwnerOrPublisherOrAdmin) || isOwner;

  const canEdit =
    (isDraft && isOwner) ||
    (isPending && (isThreadOwnerOrPublisherOrAdmin || isOwner)) ||
    (isPublished && isThreadOwnerOrPublisherOrAdmin);

  const canSubmit = isDraft && (isThreadOwnerOrPublisherOrAdmin || isOwner);

  const canPublish = (isDraft || isPending) && isThreadOwnerOrPublisherOrAdmin;

  const canUnsubmit = isPending && isOwner;

  const canUnpublish =
    isPublished && (isThreadOwnerOrPublisherOrAdmin || isOwner);

  const canDelete = isThreadOwnerOrPublisherOrAdmin || isOwner;

  return {
    user,
    thread,
    isOwner,
    canContributeInThread,
    canManageThread,
    canPublishInThread,
    canPrint,
    canDelete,
    canModifyShare,
    canEdit,
    canPublish,
    canSubmit,
    canUnpublish,
    canUnsubmit,
  };
}
