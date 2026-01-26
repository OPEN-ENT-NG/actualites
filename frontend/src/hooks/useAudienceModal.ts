import { useState } from 'react';
import { Info } from '~/models/info';
import { useIncrementInfoViews } from '~/services/queries';
import { useInfoAudienceStore } from '~/store/audienceStore';
import { useThreadUserRights } from './useThreadUserRights';

export const useAudienceModal = (info: Info) => {
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

  return {
    viewsCounter: viewsCounterByInfoId?.[info.id] ?? 0,
    incrementViewsMutation,
    isAudienceOpen,
    handleViewsCounterClick,
    handleModalClose: () => setIsAudienceOpen(false),
  };
};
