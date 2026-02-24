import { Button, Flex, useDate } from '@edifice.io/react';
import { IconCalendarEdit } from '@edifice.io/react/icons';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetailsFormParams } from '~/store/infoFormStore';
import {
  INFO_DATES_RESET_VALUES,
  INFO_HOURS_DATE_DEFAULT,
} from './InfoDetailsForm';
import { InfoDetailsFormDatesModal } from './InfoDetailsFormDatesModal';

export function InfoDetailsFormDates() {
  const { t } = useI18n();
  const { formatDate, dateIsToday, dateIsSame } = useDate();
  const { getValues, setValue } = useFormContext<InfoDetailsFormParams>();

  const [isModalOpen, setModalOpen] = useState(false);
  const publicationDate = getValues().publicationDate;
  const expirationDate = getValues().expirationDate;

  const dateString = useMemo(() => {
    if (!publicationDate || !expirationDate) {
      return t('actualites.info.createForm.dates.default');
    }

    return t('actualites.info.createForm.dates.customized', {
      publicationDate: formatDate(publicationDate.toISOString(), 'long'),
      expirationDate: formatDate(expirationDate.toISOString(), 'long'),
    });
  }, [publicationDate, expirationDate]);

  const handleUpdateDates = (
    pickedPublicationDate: Date,
    pickedExpirationDate: Date,
  ) => {
    // Not replace an undefined date if the value hasn't changed
    const newPublicationDate =
      !publicationDate && dateIsToday(pickedPublicationDate)
        ? undefined
        : new Date(pickedPublicationDate);

    if (newPublicationDate) {
      newPublicationDate.setHours(INFO_HOURS_DATE_DEFAULT, 0, 0, 0);
    }
    setValue('publicationDate', newPublicationDate, {
      shouldDirty: true,
      shouldValidate: true,
    });

    let newExpirationDate = undefined;
    if (
      newPublicationDate ||
      (!expirationDate &&
        !dateIsSame(
          pickedExpirationDate,
          INFO_DATES_RESET_VALUES.expirationDate,
        ))
    ) {
      newExpirationDate = new Date(pickedExpirationDate);
      newExpirationDate.setHours(INFO_HOURS_DATE_DEFAULT, 0, 0, 0);
    }

    setValue('expirationDate', newExpirationDate, {
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
