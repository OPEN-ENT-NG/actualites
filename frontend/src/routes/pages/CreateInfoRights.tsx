import { ShareRight, ShareRightActionDisplayName } from '@edifice.io/client';
import { ShareOptions, ShareResources } from '@edifice.io/react';
import { QueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import { InfoFormActions } from '~/features/info-form/components/InfoFormActions';
import { InfoFormHeader } from '~/features/info-form/components/InfoFormHeader';
import { baseUrlAPI } from '~/services';
import { useInfoShares } from '~/services/queries';
import { CreationStep, useInfoFormStore } from '~/store/infoFormStore';

interface CreateInfoRightsProps {
  infoId: number;
}

export const loader =
  (_queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const infoId = params['infoIdAsString']
      ? Number.parseInt(params['infoIdAsString'])
      : NaN;
    if (isNaN(infoId)) {
      throw new Error('Invalid infoId');
    }
    return { infoId };
  };

export function CreateInfoRights() {
  const { infoId } = useLoaderData() as CreateInfoRightsProps;
  const setCurrentCreationStep = useInfoFormStore.use.setCurrentCreationStep();
  const setInfoId = useInfoFormStore.use.setInfoId();
  const setInfoShares = useInfoFormStore.use.setInfoShares();
  const setInfoSharesFormDirty = useInfoFormStore.use.setInfoSharesFormDirty();

  useEffect(() => {
    setCurrentCreationStep(CreationStep.INFO_RIGHTS);
  }, [setCurrentCreationStep]);

  useEffect(() => {
    setInfoId(infoId);
  }, [infoId, setInfoId]);

  // Share Modal State
  const { data: infoShares } = useInfoShares(infoId);

  const shareOptions = useMemo<ShareOptions>(() => {
    return {
      resourceCreatorId: infoShares?.owner || '',
      resourceId: String(infoId),
      resourceRights: infoShares?.rights || [],
      filteredActions: ['read', 'comment'] as ShareRightActionDisplayName[],
      urls: {
        getResourceRights: `${baseUrlAPI}/infos/${String(infoId)}/shares`,
        saveResourceRights: `${baseUrlAPI}/infos/${String(infoId)}/shares`,
        getShareMapping: `${baseUrlAPI}/rights/sharing`,
      },
    };
  }, [infoShares]);

  const handleShareInfoChange = (rights: ShareRight[], isDirty: boolean) => {
    setInfoSharesFormDirty(isDirty);
    setInfoShares(rights || []);
  };

  return (
    <>
      <InfoFormHeader />
      <ShareResources
        onChange={handleShareInfoChange}
        shareOptions={shareOptions}
      />
      <InfoFormActions />
    </>
  );
}
