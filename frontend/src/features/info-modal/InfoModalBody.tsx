import { Editor } from '@edifice.io/react/editor';
import { useEffect } from 'react';
import { useAudience } from '~/hooks/useAudience';
import { useInfoStatus } from '~/hooks/useInfoStatus';
import { Info, InfoDetails } from '~/models/info';
import { CommentList } from '../../components/comment-list/CommentList';
import { InfoCardHeader } from '../../components/InfoCard/InfoCardHeader';

export type InfoModalBodyProps = {
  info: InfoDetails & Info;
};

export const InfoModalBody = ({ info }: InfoModalBodyProps) => {
  const { extendedStatus } = useInfoStatus(info);
  const { incrementViewsCounter } = useAudience(info);

  useEffect(incrementViewsCounter, []);

  return (
    <>
      <InfoCardHeader info={info} extendedStatus={extendedStatus} />

      <Editor content={info.content} mode="read" variant="ghost" />

      <CommentList info={info} withPagination={false} />
    </>
  );
};
