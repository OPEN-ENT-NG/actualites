import { useCallback, useState } from 'react';
import { Info } from '~/models/info';
import { useIncrementInfoViews } from '~/services/queries';
import { useInfoAudienceStore } from '~/store/audienceStore';
import { useInfoStatus } from './useInfoStatus';
import { useThreadUserRights } from './useThreadUserRights';

export const useAudience = (info: Info) => {
  const [isAudienceOpen, setIsAudienceOpen] = useState(false);
  const { mutate: incrementViewsMutation } = useIncrementInfoViews(info.id);
  const { viewsCounterByInfoId } = useInfoAudienceStore();
  const { isDraft, isPending } = useInfoStatus(info);

  const {
    isThreadOwner,
    canContributeInThread,
    canManageThread,
    canPublishInThread,
  } = useThreadUserRights(info.threadId);

  const canViewDetails =
    isThreadOwner ||
    canContributeInThread ||
    canManageThread ||
    canPublishInThread;

  const handleViewsCounterClick = () => {
    if (canViewDetails) {
      setIsAudienceOpen(true);
    }
  };

  const incrementViewsCounter = useCallback(() => {
    // Do not increment views for draft and pending infos.
    if (!isDraft && !isPending) incrementViewsMutation();
  }, [incrementViewsMutation, info]);

  return {
    canViewDetails,
    viewsCounter: viewsCounterByInfoId?.[info.id] ?? 0,
    incrementViewsCounter,
    isAudienceOpen,
    handleViewsCounterClick,
    handleModalClose: () => setIsAudienceOpen(false),
  };
};
