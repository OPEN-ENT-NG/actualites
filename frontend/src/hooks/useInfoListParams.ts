import { useSearchParams } from 'react-router-dom';
import { InfoSegmentedValue, InfoStatus } from '~/models/info';

const QUERY_PARAM_VALUE = 'status';
const DEFAULT_QUERY_PARAM_VALUE = InfoStatus.PUBLISHED;

export function useInfoSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const valueParam = searchParams.get(QUERY_PARAM_VALUE);

  const upperValue = valueParam?.toUpperCase();

  const value: InfoSegmentedValue | undefined = upperValue
    ? (upperValue as InfoSegmentedValue)
    : DEFAULT_QUERY_PARAM_VALUE;

  const updateParams = (updates: { value?: InfoSegmentedValue | null }) => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (updates.value === null || updates.value === undefined) {
      newSearchParams.delete(QUERY_PARAM_VALUE);
    } else {
      newSearchParams.set(QUERY_PARAM_VALUE, updates.value.toLowerCase());
    }

    setSearchParams(newSearchParams, { replace: true });
  };

  return {
    value,
    updateParams,
  };
}
