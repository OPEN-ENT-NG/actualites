import {
  Alert,
  Button,
  LoadingScreen,
  Modal,
  useToggle,
} from '@edifice.io/react';
import { IconRafterRight } from '@edifice.io/react/icons';
import { useId, useState } from 'react';
import { useI18n } from '~/hooks/useI18n';
import { baseUrl } from '~/services';
import { InfoCardProps } from './InfoCard';

import './InfoCardPreviousContent.css';

export const InfoCardPreviousContent = ({
  info,
}: Pick<InfoCardProps, 'info'>) => {
  const { t } = useI18n();
  const [isModalOpen, toggle] = useToggle(false);
  const modalId = useId();
  const [isLoaded, setIsLoaded] = useState(false);

  if (info.previousContentVersion >= info.contentVersion) {
    return null;
  }

  const handlePreviousContentClick = () => toggle();
  const handleModalClose = () => toggle();
  const handleIframeLoad = () => setIsLoaded(true);

  return (
    <>
      <Alert type="warning" className="info-card-previouscontent-alert mb-12">
        <div className="d-md-flex justify-content-between align-items-center flex-row">
          <div>
            <p>{t('actualites.previouscontent.alert.paragraph1')}</p>
            <p>{t('actualites.previouscontent.alert.paragraph2')}</p>
          </div>
          <Button
            color="tertiary"
            className="previouscontent-alert-view-more text-gray-700 h-auto"
            type="button"
            variant="ghost"
            rightIcon={<IconRafterRight />}
            onClick={handlePreviousContentClick}
          >
            {t('actualites.previouscontent.alert.button')}
          </Button>
        </div>
      </Alert>

      {isModalOpen && (
        <Modal
          size="md"
          viewport
          id={modalId}
          isOpen={isModalOpen}
          onModalClose={handleModalClose}
        >
          <Modal.Header onModalClose={handleModalClose}>
            {info.title}
          </Modal.Header>
          <Modal.Body className="d-flex flex-fill align-content-center justify-content-center">
            {!isLoaded && (
              <div className="position-absolute top-0 start-0 bottom-0 end-0 d-flex align-items-center justify-content-center bg-white z-index-1">
                <LoadingScreen />
              </div>
            )}
            <iframe
              className="flex-fill"
              src={`${baseUrl}/oldformat/${info.threadId}/${info.id}`}
              title={info.title}
              onLoad={handleIframeLoad}
            ></iframe>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleModalClose}>
              {t('actualites.previouscontent.modal.close')}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};
