import { Modal } from '@edifice.io/react';
import { useState } from 'react';
import { useScrollToElement } from '~/hooks/useScrollToElement';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { Info, InfoDetails, InfoId } from '~/models/info';
import { useInfoById } from '~/services/queries';
import { InfoModalBody } from './InfoModalBody';
import { InfoModalSkeleton } from './InfoModalSkeleton';

export type InfoModalProps = {
  /** ID of the information to display in the modal */
  infoId: InfoId;
};

export const InfoModal = ({ infoId }: InfoModalProps) => {
  const { threadId } = useThreadInfoParams();
  const { data, isPending } = useInfoById(infoId);
  const { removeHash } = useScrollToElement();
  const [opened, setOpened] = useState(true);

  if (isPending || !data || !threadId) return <InfoModalSkeleton />;

  const info: InfoDetails & Info = { threadId, ...data };
  const handleModalClose = () => {
    removeHash();
    setOpened(false);
  };

  return (
    <Modal
      id="info-modal"
      isOpen={opened}
      onModalClose={handleModalClose}
      size="lg"
    >
      <Modal.Header onModalClose={handleModalClose}>{null}</Modal.Header>
      <InfoModalBody info={info} />
    </Modal>
  );
};
