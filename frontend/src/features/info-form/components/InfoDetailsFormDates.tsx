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
  const publicationDateString = getValues()?.publicationDate;
  const expirationDateString = getValues()?.expirationDate;
  const [publicationDate, setPublicationDate] = useState<Date>(
    new Date(publicationDateString),
  );
  const [expirationDate, setExpirationDate] = useState<Date>(
    new Date(expirationDateString),
  );

  const dateString = useMemo(() => {
    if (
      INFO_DETAILS_DEFAULT_VALUES.publicationDate === publicationDateString &&
      INFO_DETAILS_DEFAULT_VALUES.expirationDate === expirationDateString
    ) {
      return t('actualites.info.createForm.dates.default');
    }

    return t('actualites.info.createForm.dates.customized', {
      publicationDate: formatDate(publicationDateString.toISOString(), 'long'),
      expirationDate: formatDate(expirationDateString.toISOString(), 'long'),
    });
    // return `${formatDate(publicationDateString?.toISOString(), 'long')} - ${formatDate(expirationDateString?.toISOString(), 'long')}`;
  }, [publicationDateString, expirationDateString]);

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleUpdateDates = () => {
    setValue(
      'publicationDate',
      publicationDate || INFO_DETAILS_DEFAULT_VALUES.publicationDate,
    );
    setValue(
      'expirationDate',
      expirationDate || INFO_DETAILS_DEFAULT_VALUES.expirationDate,
    );
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
        setPublicationDate={setPublicationDate}
        expirationDate={expirationDate}
        setExpirationDate={setExpirationDate}
        onUpdate={handleUpdateDates}
      />
    </>
  );
}
