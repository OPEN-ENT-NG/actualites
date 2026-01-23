import { useEffect, useMemo } from 'react';
import {
  INFO_DETAILS_DEFAULT_VALUES,
  InfoDetailsCreateFormActions,
  InfoDetailsForm,
  InfoFormActionsSkeleton,
  InfoFormHeader,
  InfoFormHeaderSkeleton,
  InfoFormSkeleton,
} from '~/features';
import { InfoDetailsEditFormActions } from '~/features/info-form/components/InfoDetailsEditFormActions';
import { useInfoForm } from '~/features/info-form/hooks/useInfoForm';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { useInfoById, useThreads } from '~/services/queries';
import {
  InfoDetailsFormParams,
  InfoWorkflowStep,
  useInfoFormStore,
} from '~/store/infoFormStore';

export function InfoWorkflowDetails() {
  const { data: threads } = useThreads();
  const { infoId } = useThreadInfoParams();
  const { data: info } = useInfoById(Number(infoId));
  const { type } = useInfoForm();

  const setCurrentCreationStep = useInfoFormStore.use.setCurrentWorkflowStep();

  useEffect(() => {
    setCurrentCreationStep(InfoWorkflowStep.INFO_DETAILS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const infoDetails: InfoDetailsFormParams | undefined = useMemo(() => {
    if (infoId && info) {
      const publicationDate = info.publicationDate
      ? new Date(info.publicationDate)
      : undefined;
      const expirationDate = info.expirationDate
        ? new Date(info.expirationDate)
        : INFO_DETAILS_DEFAULT_VALUES.expirationDate;
      return {
        infoId: info.id,
        thread_id: info.thread?.id,
        title: info.title,
        content: info.content,
        headline: info.headline,
        infoStatus: info.status,
        publicationDate,
        expirationDate,
      };
    }
  }, [infoId, info]);

  return threads && (!infoId || (infoId && infoDetails)) ? (
    <>
      <InfoFormHeader className="mb-24" />
      <InfoDetailsForm infoDetails={infoDetails} />
      {type === 'edit' ? (
        <InfoDetailsEditFormActions />
      ) : (
        <InfoDetailsCreateFormActions />
      )}
    </>
  ) : (
    <>
      <InfoFormHeaderSkeleton />
      <InfoFormSkeleton />
      <InfoFormActionsSkeleton />
    </>
  );
}
