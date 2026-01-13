import { QueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { LoaderFunctionArgs } from 'react-router-dom';
import { InfoDetailsCreateFormActions } from '~/features/info-form/components/InfoDetailsCreateFormActions';
import {
  INFO_DETAILS_DEFAULT_VALUES,
  InfoDetailsForm,
} from '~/features/info-form/components/InfoDetailsForm';
import { InfoFormActionsSkeleton } from '~/features/info-form/components/InfoFormActionsSkeleton';
import { InfoFormHeader } from '~/features/info-form/components/InfoFormHeader';
import { InfoFormHeaderSkeleton } from '~/features/info-form/components/InfoFormHeaderSkeleton';
import { InfoFormSkeleton } from '~/features/info-form/components/InfoFormSkeleton';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { infoQueryOptions, useInfoById, useThreads } from '~/services/queries';
import {
  InfoDetailsFormParams,
  InfoWorkflowStep,
  useInfoFormStore,
} from '~/store/infoFormStore';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    if (params.infoId) {
      const queryMessage = infoQueryOptions.getInfoById(Number(params.infoId));
      queryClient.ensureQueryData(queryMessage);
    }

    return null;
  };

export function InfoWorkflowDetails() {
  const { data: threads } = useThreads();
  const { infoId } = useThreadInfoParams();

  const { data: info } = useInfoById(Number(infoId));
  const setCurrentCreationStep = useInfoFormStore.use.setCurrentWorkflowStep();

  useEffect(() => {
    setCurrentCreationStep(InfoWorkflowStep.INFO_DETAILS);
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
        publicationDate: info.publicationDate
          ? new Date(info.publicationDate)
          : INFO_DETAILS_DEFAULT_VALUES.publicationDate,
        expirationDate: info.expirationDate
          ? new Date(info.expirationDate)
          : INFO_DETAILS_DEFAULT_VALUES.expirationDate,
      };
    }
    return undefined;
  }, [infoId, info]);
  return threads && (!infoId || (infoId && infoDetails)) ? (
    <>
      <InfoFormHeader />
      <InfoDetailsForm infoDetails={infoDetails} />
      <InfoDetailsCreateFormActions />
    </>
  ) : (
    <>
      <InfoFormHeaderSkeleton />
      <InfoFormSkeleton />
      <InfoFormActionsSkeleton />
    </>
  );
}
