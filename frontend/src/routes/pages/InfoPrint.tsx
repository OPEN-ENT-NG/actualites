import { QueryClient } from '@tanstack/react-query';
import {
  LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from 'react-router-dom';
import { InfoCardContent } from '~/components';
import { infoQueryOptions, useInfoById } from '~/services/queries';
import { Info } from '~/models/info';
import { useEffect, useState } from 'react';
import { InfoCardHeaderPrint } from '~/components/InfoCard/InfoCardHeaderPrint';
import { useThread } from '~/hooks/useThread';

interface PrintInfoProps {
  infoId: number;
}

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const infoId = params['infoIdAsString']
      ? Number.parseInt(params['infoIdAsString'])
      : NaN;

    if (isNaN(infoId)) {
      throw new Error('Invalid infoId');
    }

    const queryInfo = infoQueryOptions.getInfoById(Number(infoId));

    queryClient.ensureQueryData(queryInfo);
    return { infoId };
  };

export function InfoPrint() {
  const { infoId } = useLoaderData() as PrintInfoProps;
  const { data: infoDetail } = useInfoById(infoId);
  const [info, setInfo] = useState<Info | null>(null);
  const [searchParams] = useSearchParams();
  const thread = useThread(info?.threadId);

  const withComments =
    searchParams.get('withComments') === 'true' ? true : false;

  useEffect(() => {
    if (infoDetail) {
      setInfo({ ...infoDetail, threadId: infoDetail.thread.id });
    }
  }, [infoDetail]);
  const id = `info-print-${infoId}`;

  return (
    <article id={id} className="overflow-hidden m-32" data-testid="info-card">
      {info && (
        <>
          <InfoCardHeaderPrint info={info} thread={thread} />
          <InfoCardContent
            info={info}
            collapse={false}
            withComments={withComments}
          />
        </>
      )}
    </article>
  );
}
