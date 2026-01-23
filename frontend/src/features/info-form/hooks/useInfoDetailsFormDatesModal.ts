import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isToday from 'dayjs/plugin/isToday';
import { INFO_HOURS_DATE_DEFAULT } from '../components/InfoDetailsForm';

dayjs.extend(isSameOrAfter);
dayjs.extend(isToday);

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
    const publicationDate = dayjs(selectedPublicationDate).isToday()
      ? undefined
      : selectedPublicationDate;
    let expirationDate = undefined;
    if (publicationDate) {
      publicationDate.setHours(INFO_HOURS_DATE_DEFAULT, 0, 0, 0);
    }
    if (
      publicationDate ||
      !dayjs(selectedExpirationDate).isSame(dayjs(maxExpirationDate), 'day')
    ) {
      expirationDate = new Date(selectedExpirationDate);
      expirationDate.setHours(INFO_HOURS_DATE_DEFAULT, 0, 0, 0);
    }
    onUpdate(publicationDate, expirationDate);
  };

  const publicationDateIsDirty = useMemo(() => {
    return !dayjs(selectedPublicationDate).isSame(dayjs(publicationDate), 'day');
  }, [selectedPublicationDate, publicationDate]);
  const expirationDateIsDirty = useMemo(() => {
    return !dayjs(selectedExpirationDate).isSame(dayjs(expirationDate), 'day');
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
