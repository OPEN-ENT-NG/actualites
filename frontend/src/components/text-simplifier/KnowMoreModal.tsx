import { Button, Flex, useToggle } from '@edifice.io/react';
import { IconRafterDown, IconRafterUp } from '@edifice.io/react/icons';
import { PortalModal } from '~/components/PortalModal';
import { useI18n } from '~/hooks/useI18n';
import { Expandable } from '../Expandable';
import './KnowMoreModal.css';

export function KnowMoreModal({
  isOpen,
  onClose: handleCloseClick,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [hideWhat, handleWhatClick] = useToggle(true);
  const [hideHow, handleHowClick] = useToggle(true);

  return (
    <PortalModal
      id="know-more-modal"
      size="md"
      isOpen={isOpen}
      onModalClose={handleCloseClick}
      header={t('actualites.knowmore.title')}
      footer={
        <>
          <Button
            color="primary"
            variant="filled"
            onClick={handleCloseClick}
            data-testid="knowmore-success-button"
          >
            {t('actualites.knowmore.success')}
          </Button>
        </>
      }
    >
      <Flex direction="column" gap="16" align="start" className="knowmore">
        <p>{t('actualites.knowmore.body')}</p>
        <div>
          <Button
            data-testid="knowmore-what-toggle"
            aria-expanded={!hideWhat}
            className="foldable"
            variant="ghost"
            size="md"
            rightIcon={hideWhat ? <IconRafterDown /> : <IconRafterUp />}
            onClick={handleWhatClick}
          >
            {t('actualites.knowmore.body.what.title')}
          </Button>
          <Expandable collapse={hideWhat} transitionDurationMs={300}>
            <p>{t('actualites.knowmore.body.what.body')}</p>
          </Expandable>
        </div>
        <div>
          <Button
            data-testid="knowmore-how-toggle"
            aria-expanded={!hideHow}
            className="foldable"
            variant="ghost"
            size="md"
            rightIcon={hideHow ? <IconRafterDown /> : <IconRafterUp />}
            onClick={handleHowClick}
          >
            {t('actualites.knowmore.body.how.title')}
          </Button>
          <Expandable collapse={hideHow} transitionDurationMs={300}>
            <p>{t('actualites.knowmore.body.how.body')}</p>
          </Expandable>
        </div>
      </Flex>
    </PortalModal>
  );
}
