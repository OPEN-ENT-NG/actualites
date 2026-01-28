import { useEffect, useMemo, useState } from 'react';

import { INFO_HOURS_DATE_DEFAULT } from '../components/InfoDetailsForm';
import { useDate } from '@edifice.io/react';

interface UseInfoDetailsFormDatesModalProps {
  publicationDate: Date;
  expirationDate: Date;
  onUpdate: (publicationDate?: Date, expirationDate?: Date) => void;
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

export function useInfoDetailsFormDatesModal({
  publicationDate,
  expirationDate,
  onUpdate,
}: UseInfoDetailsFormDatesModalProps) {
  const { dateIsSame, dateIsSameOrAfter, dateIsToday } = useDate();
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

    if (dateIsSame(selectedExpirationDate, maxExpirationDate)) {
      setSelectedExpirationDate(newMaxExpirationDate);
    }
    if (
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
    const publicationDate = dateIsToday(selectedPublicationDate)
      ? undefined
      : selectedPublicationDate;
    let expirationDate = undefined;
    if (publicationDate) {
      publicationDate.setHours(INFO_HOURS_DATE_DEFAULT, 0, 0, 0);
    }
    if (
      publicationDate ||
      !dateIsSame(selectedExpirationDate, maxExpirationDate)
    ) {
      expirationDate = new Date(selectedExpirationDate);
      expirationDate.setHours(INFO_HOURS_DATE_DEFAULT, 0, 0, 0);
    }
    onUpdate(publicationDate, expirationDate);
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
    handlePublicationDateChange,
    handleExpirationDateChange,
    handleUpdate,
    publicationDateIsDirty,
    expirationDateIsDirty,
    formIsDirty,
  };
}
