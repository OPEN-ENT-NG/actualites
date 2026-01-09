import { Button, Flex, useDate } from '@edifice.io/react';
import { IconEdit } from '@edifice.io/react/icons';
import { UseFormGetValues } from 'react-hook-form';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetailsFormParams } from '~/store/infoFormStore';
import { INFO_DETAILS_DEFAULT_VALUES } from './InfoDetailsForm';
import { useMemo } from 'react';

interface InfoDetailsFormDatesProps {
  getValues: UseFormGetValues<InfoDetailsFormParams>;
}

export function InfoDetailsFormDates({ getValues }: InfoDetailsFormDatesProps) {
  const { t } = useI18n();
  const { formatDate } = useDate();
  const publicationDateString = getValues()?.publicationDate || '';
  const expirationDateString = getValues()?.expirationDate || '';

  const dateString = useMemo(() => {
    if (
      INFO_DETAILS_DEFAULT_VALUES.publicationDate === publicationDateString &&
      INFO_DETAILS_DEFAULT_VALUES.expirationDate === expirationDateString
    ) {
      return t('actualites.info.createForm.dates.default');
    }

    return t('actualites.info.createForm.dates.customized', {
      publicationDate: formatDate(publicationDateString, 'long'),
      expirationDate: formatDate(expirationDateString, 'long'),
    });
  }, [publicationDateString, expirationDateString]);

  return (
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
          console.log('update dates');
        }}
      >
        {t('actualites.info.createForm.dates.updateButton')}
      </Button>
    </Flex>
  );
}
