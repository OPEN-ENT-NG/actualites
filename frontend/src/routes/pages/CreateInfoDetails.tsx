import { QueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { LoaderFunctionArgs } from 'react-router-dom';
import { InfoDetailsForm } from '~/features/info-form/components/InfoDetailsForm';
import { InfoDetailsFormActions } from '~/features/info-form/components/InfoDetailsFormActions';
import { InfoFormActionsSkeleton } from '~/features/info-form/components/InfoFormActionsSkeleton';
import { InfoFormHeader } from '~/features/info-form/components/InfoFormHeader';
import { InfoFormHeaderSkeleton } from '~/features/info-form/components/InfoFormHeaderSkeleton';
import { InfoFormSkeleton } from '~/features/info-form/components/InfoFormSkeleton';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
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
  const { infoId } = useThreadInfoParams();

  const { data: info } = useInfoById(Number(infoId));
  const setCurrentCreationStep = useInfoFormStore.use.setCurrentCreationStep();

  useEffect(() => {
    setCurrentCreationStep(CreationStep.INFO_DETAILS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const infoDetails: InfoDetailsFormParams | undefined = useMemo(() => {
    if (infoId && info) {
      return {
        infoId: info.id,
        thread_id: info.thread?.id,
        title: info.title,
        content: info.content,
        headline: info.headline,
        infoStatus: info.status,
      };
    }
    return undefined;
  }, [infoId, info]);

  return (
    <>
      {threads && (!infoId || (infoId && infoDetails)) ? (
        <>
          <InfoFormHeader />
          <InfoDetailsForm infoDetails={infoDetails} />
          <InfoDetailsFormActions />
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
