import { useCallback, useState } from 'react';
import { Info } from '~/models/info';
import { useIncrementInfoViews } from '~/services/queries';
import { useInfoAudienceStore } from '~/store/audienceStore';
import { useThreadUserRights } from './useThreadUserRights';

export const useAudience = (info: Info) => {
  const [isAudienceOpen, setIsAudienceOpen] = useState(false);
  const { mutate: incrementViewsMutation } = useIncrementInfoViews(info.id);
  const { viewsCounterByInfoId } = useInfoAudienceStore();

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

  const incrementViewsCounter = useCallback(
    () => incrementViewsMutation(),
    [incrementViewsMutation],
  );

  return {
    viewsCounter: viewsCounterByInfoId?.[info.id] ?? 0,
    incrementViewsCounter,
    isAudienceOpen,
    handleViewsCounterClick,
    handleModalClose: () => setIsAudienceOpen(false),
  };
};
