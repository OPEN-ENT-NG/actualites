import { Alert, Button, Modal, useToggle } from '@edifice.io/react';
import { IconRafterRight } from '@edifice.io/react/icons';
import ModalBody from 'node_modules/@edifice.io/react/dist/components/Modal/ModalBody';
import ModalFooter from 'node_modules/@edifice.io/react/dist/components/Modal/ModalFooter';
import ModalHeader from 'node_modules/@edifice.io/react/dist/components/Modal/ModalHeader';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { InfoCardProps } from './InfoCard';

export const InfoCardPreviousContent = ({
  info,
}: Pick<InfoCardProps, 'info'>) => {
  const { t } = useTranslation('actualites');
  const [isModalOpen, toggle] = useToggle(false);
  const modalId = useId();

  const handlePreviousContentClick = () => toggle();
  const handleModalClose = () => toggle();

  return (
    <>
      <Alert
        type="warning"
        className="info-card-previouscontent-alert mb-12"
        button={
          <Button
            color="secondary"
            type="button"
            variant="ghost"
            rightIcon={<IconRafterRight />}
            onClick={handlePreviousContentClick}
          >
            {t('actualites.previouscontent.alert.button')}
          </Button>
        }
      >
        <div>
          <p>{t('actualites.previouscontent.alert.paragraph1')}</p>
          <p>{t('actualites.previouscontent.alert.paragraph1')}</p>
        </div>
      </Alert>

      {isModalOpen && (
        <Modal
          size="md"
          id={modalId}
          isOpen={isModalOpen}
          onModalClose={handleModalClose}
        >
          <ModalHeader onModalClose={handleModalClose}>
            {info.title}
          </ModalHeader>
          <ModalBody>coucou</ModalBody>
          <ModalFooter>
            <Button>{t('actualites.previouscontent.modal.close')}</Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};
