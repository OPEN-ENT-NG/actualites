import { Modal } from '@edifice.io/react';
import { Editor } from '@edifice.io/react/editor';
import { useInfoStatus } from '~/hooks/useInfoStatus';
import { Info, InfoDetails } from '~/models/info';
import { CommentList } from '../comment-list/CommentList';
import { InfoCardHeader } from '../InfoCard/InfoCardHeader';

export type InfoModalBodyProps = {
  info: InfoDetails & Info;
};

export const InfoModalBody = ({ info }: InfoModalBodyProps) => {
  const { extendedStatus } = useInfoStatus(info);
  return (
    <Modal.Body>
      <InfoCardHeader info={info} extendedStatus={extendedStatus} />

      <Editor content={info.content} mode="read" variant="ghost" />

      <CommentList info={info} />
    </Modal.Body>
  );
};
