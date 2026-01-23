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
import { useInfoDetailsFormDatesModal } from '../hooks/useInfoDetailsFormDatesModal';

interface InfoDetailsFormDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicationDate: Date;
  expirationDate: Date;
  onUpdate: (publicationDate?: Date, expirationDate?: Date) => void;
}

export function InfoDetailsFormDatesModal({
  isOpen,
  onClose,
  publicationDate,
  expirationDate,
  onUpdate,
}: InfoDetailsFormDatesModalProps) {
  const { t } = useI18n();
  const { md } = useBreakpoint();

  const {
    selectedPublicationDate,
    selectedExpirationDate,
    minExpirationDate,
    maxExpirationDate,
    minPublicationDate,
    handlePublicationDateChange,
    handleExpirationDateChange,
    handleUpdate,
    formIsDirty,
  } = useInfoDetailsFormDatesModal({
    publicationDate,
    expirationDate,
    onUpdate,
  });

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
          <Button
            color="primary"
            onClick={handleUpdate}
            disabled={!formIsDirty}
          >
            {t('actualites.info.createForm.dates.modal.submitButton')}
          </Button>
        </>
      }
    >
      <Flex direction={'column'} gap="16">
        <Flex
          direction={md ? 'row' : 'column'}
          gap={md ? '24' : '16'}
          align={md ? 'center' : 'stretch'}
          className="col-12"
          wrap="nowrap"
        >
          <FormControl id={'publicationDate'} className="flex-fill">
            <Label className="d-block">
              {t('actualites.info.createForm.dates.modal.publicationDate')}
            </Label>
            <DatePicker
              value={selectedPublicationDate}
              onChange={handlePublicationDateChange}
              minDate={minPublicationDate}
              dateFormat={t(
                'actualites.info.createForm.dates.modal.dateFormat',
              )}
              className="w-100"
            />
          </FormControl>
          <FormControl id={'expirationDate'} className="flex-fill">
            <Label className="d-block">
              {t('actualites.info.createForm.dates.modal.expirationDate')}
            </Label>
            <DatePicker
              value={selectedExpirationDate}
              onChange={handleExpirationDateChange}
              minDate={minExpirationDate}
              maxDate={maxExpirationDate}
              dateFormat={t(
                'actualites.info.createForm.dates.modal.dateFormat',
              )}
              className="w-100"
            />
          </FormControl>
        </Flex>
        <p className="small">
          {t('actualites.info.createForm.dates.modal.publicationInfo')}
        </p>
      </Flex>
    </PortalModal>
  );
}
