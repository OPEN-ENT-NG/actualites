import { QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { LoaderFunctionArgs, useParams } from 'react-router-dom';
import { InfoDetailsForm } from '~/features/info-form/components/InfoDetailsForm';
import { InfoFormActions } from '~/features/info-form/components/InfoFormActions';
import { InfoFormActionsSkeleton } from '~/features/info-form/components/InfoFormActionsSkeleton';
import { InfoFormHeader } from '~/features/info-form/components/InfoFormHeader';
import { InfoFormHeaderSkeleton } from '~/features/info-form/components/InfoFormHeaderSkeleton';
import { InfoFormSkeleton } from '~/features/info-form/components/InfoFormSkeleton';
import { infoQueryOptions, useInfoById, useThreads } from '~/services/queries';
import {
  CreationStep,
  InfoDetailsFormParams,
  useInfoFormStore,
} from '~/store/infoFormStore';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params /*, request*/ }: LoaderFunctionArgs) => {
    if (params.infoId) {
      const queryMessage = infoQueryOptions.getInfoById(Number(params.infoId));

      queryClient.ensureQueryData(queryMessage);
    }

    return null;
  };

export function CreateInfoDetails() {
  const { data: threads } = useThreads();
  const { infoId } = useParams();

  const { data: info } = useInfoById(Number(infoId));
  const setCurrentCreationStep = useInfoFormStore.use.setCurrentCreationStep();

  useEffect(() => {
    setCurrentCreationStep(CreationStep.INFO_DETAILS);
  }, [setCurrentCreationStep]);

  let infoDetails: InfoDetailsFormParams | undefined;
  if (info) {
    infoDetails = {
      infoId: info.id,
      thread_id: info.thread?.id,
      title: info.title,
      content: info.content,
      headline: info.headline,
      infoStatus: info.status,
    };
  }

  return (
    <>
      {threads ? (
        <>
          <InfoFormHeader />
          <InfoDetailsForm infoDetails={infoDetails} />
          <InfoFormActions />
        </>
      ) : (
        <>
          <InfoFormHeaderSkeleton />
          <InfoFormSkeleton />
          <InfoFormActionsSkeleton />
        </>
      )}
    </>
  );
}
