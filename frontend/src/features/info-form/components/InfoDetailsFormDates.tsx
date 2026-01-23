import { Button, Flex, useDate } from '@edifice.io/react';
import { IconCalendarEdit } from '@edifice.io/react/icons';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetailsFormParams } from '~/store/infoFormStore';
import {
  INFO_DATES_RESET_VALUES,
  INFO_DETAILS_DEFAULT_VALUES,
} from './InfoDetailsForm';
import { InfoDetailsFormDatesModal } from './InfoDetailsFormDatesModal';

export function InfoDetailsFormDates() {
  const { t } = useI18n();
  const { formatDate } = useDate();
  const { getValues, setValue } = useFormContext<InfoDetailsFormParams>();

  const [isModalOpen, setModalOpen] = useState(false);
  const publicationDate = getValues().publicationDate;
  const expirationDate = getValues().expirationDate;

  const dateString = useMemo(() => {
    const areNotDefinedDates =
      dayjs(INFO_DETAILS_DEFAULT_VALUES.publicationDate).isSame(
        dayjs(publicationDate),
        'day',
      ) &&
      dayjs(INFO_DETAILS_DEFAULT_VALUES.expirationDate).isSame(
        dayjs(expirationDate),
        'day',
      );
    if (areNotDefinedDates || !publicationDate || !expirationDate) {
      return t('actualites.info.createForm.dates.default');
    }

    return t('actualites.info.createForm.dates.customized', {
      publicationDate: formatDate(publicationDate.toISOString(), 'long'),
      expirationDate: formatDate(expirationDate.toISOString(), 'long'),
    });
  }, [publicationDate, expirationDate]);

  const handleUpdateDates = (publicationDate?: Date, expirationDate?: Date) => {
    setValue('publicationDate', publicationDate, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('expirationDate', expirationDate, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setModalOpen(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Flex align="center" gap="8" justify="end">
        <p className="text-gray-700">{dateString}</p>
        <Button
          data-testid={'info-view-dates-edit-button'}
          color="tertiary"
          variant="ghost"
          size="sm"
          leftIcon={<IconCalendarEdit />}
          onClick={() => {
            setModalOpen(true);
          }}
        >
          {t('actualites.info.createForm.dates.updateButton')}
        </Button>
      </Flex>
      {isModalOpen && (
        <InfoDetailsFormDatesModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          publicationDate={
            publicationDate ?? INFO_DATES_RESET_VALUES.publicationDate
          }
          expirationDate={
            expirationDate ?? INFO_DATES_RESET_VALUES.expirationDate
          }
          onUpdate={handleUpdateDates}
        />
      )}
    </>
  );
}
