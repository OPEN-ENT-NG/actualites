import { useState } from 'react';
import { Info } from '~/models/info';
import { useIncrementInfoViews } from '~/services/queries';
import { useThreadUserRights } from './useThreadUserRights';

export const useAudienceModal = (info: Info) => {
  const [isAudienceOpen, setIsAudienceOpen] = useState(false);
  const { mutate: incrementViewsMutation } = useIncrementInfoViews(info.id);
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
    viewsCounter: 12,
    incrementViewsMutation,
    isAudienceOpen,
    handleViewsCounterClick,
    handleModalClose: () => setIsAudienceOpen(false),
  };
};
