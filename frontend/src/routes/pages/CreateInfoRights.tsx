import { QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { InfoFormActions } from '~/features/info-form/components/InfoFormActions';
import { InfoFormHeader } from '~/features/info-form/components/InfoFormHeader';
import { CreationStep, useInfoFormStore } from '~/store/infoFormStore';

export const loader = (_queryClient: QueryClient) => async () => {
  return null;
};

export function CreateInfoRights() {
  const setCurrentCreationStep = useInfoFormStore.use.setCurrentCreationStep();

  useEffect(() => {
    setCurrentCreationStep(CreationStep.INFO_RIGHTS);
  }, [setCurrentCreationStep]);

  return (
    <>
      <InfoFormHeader />
      {/* The rights form will be added here later */}
      <InfoFormActions />
    </>
  );
}
