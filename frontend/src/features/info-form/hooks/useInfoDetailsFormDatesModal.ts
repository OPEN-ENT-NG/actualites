import { useEffect, useMemo, useState } from 'react';

import { useDate } from '@edifice.io/react';

interface UseInfoDetailsFormDatesModalProps {
  publicationDate: Date;
  expirationDate: Date;
  onUpdate: (publicationDate: Date, expirationDate: Date) => void;
}

const DEFAULT_EXPIRATION_DATE_MAX_YEAR_DIFFERENCE = 1;

const getMinExpirationDate = (publicationDate: Date) => {
  const newMinExpirationDate = new Date(publicationDate);
  newMinExpirationDate.setDate(
    newMinExpirationDate.getDate() +
      DEFAULT_EXPIRATION_DATE_MAX_YEAR_DIFFERENCE,
  );
  return newMinExpirationDate;
};

export const getMaxExpirationDate = (publicationDate: Date) => {
  const newExpirationDate = new Date(publicationDate);
  newExpirationDate.setFullYear(
    newExpirationDate.getFullYear() +
      DEFAULT_EXPIRATION_DATE_MAX_YEAR_DIFFERENCE,
  );
  return newExpirationDate;
};

export function useInfoDetailsFormDatesModal({
  publicationDate,
  expirationDate,
  onUpdate,
}: UseInfoDetailsFormDatesModalProps) {
  const { dateIsSame, dateIsSameOrAfter } = useDate();
  const maxPublicationDate = new Date();
  maxPublicationDate.setFullYear(maxPublicationDate.getFullYear() + 1);
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

  // ExpirationDate auto selection
  useEffect(() => {
    if (!selectedPublicationDate) return;

    // Calculate min and max expiration dates
    const newMinExpirationDate = getMinExpirationDate(selectedPublicationDate);
    setMinExpirationDate(newMinExpirationDate);
    const newMaxExpirationDate = getMaxExpirationDate(selectedPublicationDate);
    setMaxExpirationDate(newMaxExpirationDate);

    // Auto selection of the expiration date
    const expirationDateChangedByUser = !dateIsSame(
      selectedExpirationDate,
      maxExpirationDate,
      'day',
    );
    if (!expirationDateChangedByUser) {
      setSelectedExpirationDate(newMaxExpirationDate);
    } else if (
      dateIsSameOrAfter(selectedPublicationDate, selectedExpirationDate, 'day')
    ) {
      setSelectedExpirationDate(newMinExpirationDate);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPublicationDate]);

  const handlePublicationDateChange = (date?: Date) => {
    if (date) {
      setSelectedPublicationDate(date);
    }
  };

  const handleExpirationDateChange = (date?: Date) => {
    if (date) {
      setSelectedExpirationDate(date);
    }
  };

  const handleUpdate = () => {
    onUpdate(selectedPublicationDate, selectedExpirationDate);
  };

  const publicationDateIsDirty = useMemo(() => {
    return !dateIsSame(selectedPublicationDate, publicationDate);
  }, [selectedPublicationDate, publicationDate]);
  const expirationDateIsDirty = useMemo(() => {
    return !dateIsSame(selectedExpirationDate, expirationDate);
  }, [selectedExpirationDate, expirationDate]);
  const formIsDirty = useMemo(() => {
    return publicationDateIsDirty || expirationDateIsDirty;
  }, [publicationDateIsDirty, expirationDateIsDirty]);

  return {
    selectedPublicationDate,
    setSelectedPublicationDate,
    selectedExpirationDate,
    setSelectedExpirationDate,
    minExpirationDate,
    maxExpirationDate,
    minPublicationDate,
    maxPublicationDate,
    handlePublicationDateChange,
    handleExpirationDateChange,
    handleUpdate,
    publicationDateIsDirty,
    expirationDateIsDirty,
    formIsDirty,
  };
}
