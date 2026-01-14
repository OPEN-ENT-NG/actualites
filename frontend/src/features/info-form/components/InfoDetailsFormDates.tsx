import { Button, Flex, useDate } from '@edifice.io/react';
import { IconEdit } from '@edifice.io/react/icons';
import { useMemo, useState } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetailsFormParams } from '~/store/infoFormStore';
import { INFO_DETAILS_DEFAULT_VALUES } from './InfoDetailsForm';
import { InfoDetailsFormDatesModal } from './InfoDetailsFormDatesModal';

interface InfoDetailsFormDatesProps {
  getValues: UseFormGetValues<InfoDetailsFormParams>;
  setValue: UseFormSetValue<InfoDetailsFormParams>;
}

export function InfoDetailsFormDates({
  getValues,
  setValue,
}: InfoDetailsFormDatesProps) {
  const { t } = useI18n();
  const { formatDate } = useDate();

  const [isModalOpen, setModalOpen] = useState(false);
  const publicationDate = getValues().publicationDate;
  const expirationDate = getValues().expirationDate;

  const dateString = useMemo(() => {
    if (
      +INFO_DETAILS_DEFAULT_VALUES.publicationDate.getTime() ===
        publicationDate.getTime() &&
      INFO_DETAILS_DEFAULT_VALUES.expirationDate.getTime() ===
        expirationDate.getTime()
    ) {
      return t('actualites.info.createForm.dates.default');
    }

    return t('actualites.info.createForm.dates.customized', {
      publicationDate: formatDate(publicationDate.toISOString(), 'long'),
      expirationDate: formatDate(expirationDate.toISOString(), 'long'),
    });
  }, [publicationDate, expirationDate]);

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleUpdateDates = (publicationDate: Date, expirationDate: Date) => {
    setValue('publicationDate', publicationDate);
    setValue('expirationDate', expirationDate);
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
          rightIcon={<IconEdit />}
          className="btn-icon"
          onClick={() => {
            setModalOpen(true);
          }}
        >
          {t('actualites.info.createForm.dates.updateButton')}
        </Button>
      </Flex>
      <InfoDetailsFormDatesModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        publicationDate={publicationDate}
        expirationDate={expirationDate}
        onUpdate={handleUpdateDates}
      />
    </>
  );
}
