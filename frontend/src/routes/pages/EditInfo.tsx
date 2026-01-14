import { Grid } from '@edifice.io/react';
import { QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { LoaderFunctionArgs } from 'react-router-dom';
import {
  INFO_DETAILS_DEFAULT_VALUES,
  InfoDetailsForm,
  InfoFormActionsSkeleton,
  InfoFormHeader,
  InfoFormHeaderSkeleton,
  InfoFormSkeleton,
} from '~/features';
import { InfoDetailsEditFormActions } from '~/features/info-form/components/InfoDetailsEditFormActions';
import { newDateWithoutTime } from '~/features/info-form/utils/utils';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { infoQueryOptions, useInfoById, useThreads } from '~/services/queries';
import { InfoDetailsFormParams } from '~/store/infoFormStore';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params /*, request*/ }: LoaderFunctionArgs) => {
    if (params.infoId) {
      const queryMessage = infoQueryOptions.getInfoById(Number(params.infoId));

      queryClient.ensureQueryData(queryMessage);
    }

    return null;
  };

export function EditInfo() {
  const { data: threads } = useThreads();
  const { infoId } = useThreadInfoParams();

  const { data: info } = useInfoById(Number(infoId));

  const infoDetails: InfoDetailsFormParams | undefined = useMemo(() => {
    if (infoId && info) {
      const publicationDate = info.publicationDate
        ? newDateWithoutTime(info.publicationDate)
        : INFO_DETAILS_DEFAULT_VALUES.publicationDate;
      const expirationDate = info.expirationDate
        ? newDateWithoutTime(info.expirationDate)
        : INFO_DETAILS_DEFAULT_VALUES.expirationDate;
      return {
        infoId: info.id,
        thread_id: info.thread?.id,
        title: info.title,
        content: info.content,
        headline: info.headline,
        infoStatus: info.status,
        publicationDate: publicationDate,
        expirationDate: expirationDate,
      };
    }
  }, [infoId, info]);

  return (
    <Grid className="py-16">
      <Grid.Col sm="0" md="0" lg="1" xl="2" children={null} />

      <Grid.Col sm="4" md="6" lg="6" xl="8">
        {threads && (!infoId || (infoId && infoDetails)) ? (
          <>
            <InfoFormHeader className="mb-24" />
            <InfoDetailsForm infoDetails={infoDetails} />
            <InfoDetailsEditFormActions />
          </>
        ) : (
          <>
            <InfoFormHeaderSkeleton />
            <InfoFormSkeleton />
            <InfoFormActionsSkeleton />
          </>
        )}
      </Grid.Col>

      <Grid.Col sm="0" md="0" lg="1" xl="2" children={null} />
    </Grid>
  );
}
