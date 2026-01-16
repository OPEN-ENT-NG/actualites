import {
  Button,
  DatePicker,
  Flex,
  FormControl,
  Label,
  useBreakpoint,
} from '@edifice.io/react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { PortalModal } from '~/components/PortalModal';
import { useI18n } from '~/hooks/useI18n';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isToday from 'dayjs/plugin/isToday';
dayjs.extend(isSameOrAfter);
dayjs.extend(isToday);
interface InfoDetailsFormDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicationDate: Date;
  expirationDate: Date;
  onUpdate: (publicationDate: Date, expirationDate: Date) => void;
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

  const [selectedPublicationDate, setSelectedPublicationDate] = useState<Date>(
    new Date(publicationDate),
  );
  const [selectedExpirationDate, setSelectedExpirationDate] = useState<Date>(
    new Date(expirationDate),
  );
  const [minExpirationDate, setMinExpirationDate] = useState<Date>(
    getMinExpirationDate(publicationDate),
  );
  const [maxExpirationDate, setMaxExpirationDate] = useState<Date>(
    getMaxExpirationDate(publicationDate),
  );
  const minPublicationDate = new Date();

  useEffect(() => {
    if (!selectedPublicationDate) return;
    const newMinExpirationDate = getMinExpirationDate(selectedPublicationDate);
    setMinExpirationDate(newMinExpirationDate);
    const newMaxExpirationDate = getMaxExpirationDate(selectedPublicationDate);
    setMaxExpirationDate(newMaxExpirationDate);

    if (dayjs(selectedExpirationDate).isSame(dayjs(maxExpirationDate), 'day')) {
      setSelectedExpirationDate(newMaxExpirationDate);
    }
    if (
      dayjs(selectedPublicationDate).isSameOrAfter(
        dayjs(selectedExpirationDate),
        'day',
      )
    ) {
      setSelectedExpirationDate(newMinExpirationDate);
    }
  }, [selectedPublicationDate]);

  const handleUpdate = () => {
    const publicationDate = dayjs(selectedPublicationDate).isToday()
      ? new Date()
      : selectedPublicationDate;
    onUpdate(publicationDate, selectedExpirationDate);
  };
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
          <Button color="primary" onClick={handleUpdate}>
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
              onChange={(date) => {
                return date && setSelectedPublicationDate(date);
              }}
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
              onChange={(date) => date && setSelectedExpirationDate(date)}
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

const getMinExpirationDate = (publicationDate: Date) => {
  const newMinExpirationDate = new Date(publicationDate);
  newMinExpirationDate.setDate(newMinExpirationDate.getDate() + 1);
  return newMinExpirationDate;
};
const getMaxExpirationDate = (publicationDate: Date) => {
  const newExpirationDate = new Date(publicationDate);
  newExpirationDate.setFullYear(newExpirationDate.getFullYear() + 1);
  return newExpirationDate;
};
