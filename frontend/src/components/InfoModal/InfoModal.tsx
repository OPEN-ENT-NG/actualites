import { Modal } from '@edifice.io/react';
import { useState } from 'react';
import { useI18n } from '~/hooks/useI18n';
import { useScrollToElement } from '~/hooks/useScrollToElement';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { InfoId } from '~/models/info';
import { useInfoById } from '~/services/queries';
import { InfoModalBody } from './InfoModalBody';
import { InfoModalSkeleton } from './InfoModalSkeleton';

export type InfoModalProps = {
  /** ID of the information to display in the modal */
  infoId: InfoId;
};

export const InfoModal = ({ infoId }: InfoModalProps) => {
  const { t } = useI18n();
  const { threadId } = useThreadInfoParams();
  const { data, isPending, isError } = useInfoById(infoId);
  const { removeHash } = useScrollToElement();
  const [opened, setOpened] = useState(true);

  if (isPending || !threadId) return <InfoModalSkeleton />;

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
      <Modal.Header onModalClose={handleModalClose}>
        {isError ? t('actualites.info.unavailable.title') : null}
      </Modal.Header>
      {isError ? (
        <Modal.Body>{t('actualites.info.unavailable.body')}</Modal.Body>
      ) : (
        <InfoModalBody info={{ threadId, ...data }} />
      )}
    </Modal>
  );
};
