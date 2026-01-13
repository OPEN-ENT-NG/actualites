import {
  Button,
  DatePicker,
  Flex,
  FormControl,
  Label,
  useBreakpoint,
} from '@edifice.io/react';
import { PortalModal } from '~/components/PortalModal';
import { useI18n } from '~/hooks/useI18n';

interface InfoDetailsFormDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicationDate: Date;
  setPublicationDate: (date: Date) => void;
  expirationDate: Date;
  setExpirationDate: (date: Date) => void;
  onUpdate: () => void;
}

export function InfoDetailsFormDatesModal({
  isOpen,
  onClose,
  publicationDate,
  // setPublicationDate,
  expirationDate,
  // setExpirationDate,
  onUpdate,
}: InfoDetailsFormDatesModalProps) {
  const { t } = useI18n();
  const { md } = useBreakpoint();

  const maxExpirationDate = new Date();
  maxExpirationDate.setFullYear(publicationDate.getFullYear() + 1);
  return (
    <PortalModal
      id="modal-unpublish"
      onModalClose={onClose}
      isOpen={isOpen}
      size={'md'}
      header={t('actualites.info.createForm.dates.modal.title')}
      footer={
        <>
          <Button variant="ghost" color="tertiary" onClick={onClose}>
            {t('actualites.info.createForm.dates.modal.cancelButton')}
          </Button>
          <Button color="primary" onClick={onUpdate}>
            {t('actualites.info.createForm.dates.modal.submitButton')}
          </Button>
        </>
      }
    >
      <Flex direction={'column'} gap="16">
        <Flex
          direction={md ? 'row' : 'column'}
          gap="16"
          align={md ? 'center' : 'stretch'}
          className="col-12"
          wrap="nowrap"
        >
          <FormControl id={'publicationDate'} className="flex-fill">
            <Label className="d-block">
              {t('actualites.info.createForm.dates.modal.publicationDate')}
            </Label>
            <DatePicker
              value={publicationDate}
              // onChange={(date) => setPublicationDate(date)}
              className="w-100"
            />
          </FormControl>
          <FormControl id={'expirationDate'} className="flex-fill">
            <Label className="d-block">
              {t('actualites.info.createForm.dates.modal.expirationDate')}
            </Label>
            <DatePicker
              value={expirationDate}
              // onChange={(date) => setExpirationDate(date)}
              maxDate={maxExpirationDate}
              className="w-100"
            />
          </FormControl>
        </Flex>
        <p className="small">
          {' '}
          {t('actualites.info.createForm.dates.modal.publicationInfo')}
        </p>
      </Flex>
    </PortalModal>
  );
}
