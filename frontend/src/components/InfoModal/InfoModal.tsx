import { Button } from '@edifice.io/react';
import { useState } from 'react';
import { useI18n } from '~/hooks/useI18n';
import { useScrollToElement } from '~/hooks/useScrollToElement';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { InfoId } from '~/models/info';
import { useInfoById } from '~/services/queries';
import { InfoCardSkeleton } from '../InfoCard/InfoCardSkeleton';
import { PortalModal } from '../PortalModal';
import { InfoModalBody } from './InfoModalBody';

export type InfoModalProps = {
  /** ID of the information to display in the modal */
  infoId: InfoId;
};

export const InfoModal = ({ infoId }: InfoModalProps) => {
  const { t, common_t } = useI18n();
  const { threadId } = useThreadInfoParams();
  const { data, isPending, isError } = useInfoById(infoId);
  const { removeHash } = useScrollToElement();
  const [opened, setOpened] = useState(true);

  const handleModalClose = () => {
    removeHash();
    setOpened(false);
  };

  return (
    <PortalModal
      id="info-modal"
      isOpen={opened}
      onModalClose={handleModalClose}
      size={isError ? 'sm' : 'lg'}
      header={isError ? t('actualites.info.unavailable.title') : <></>}
      footer={<Button onClick={handleModalClose}>{common_t('close')}</Button>}
    >
      {isPending ? (
        <InfoCardSkeleton />
      ) : isError || !threadId ? (
        t('actualites.info.unavailable.body')
      ) : (
        <InfoModalBody info={{ threadId, ...data }} />
      )}
    </PortalModal>
  );
};
