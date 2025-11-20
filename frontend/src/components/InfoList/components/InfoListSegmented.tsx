import { Segmented } from 'antd';
import { useI18n } from '~/hooks/useI18n';
import {
  InfoExtendedStatus,
  InfoSegmentedValue,
  InfoStatus,
} from '~/models/info';

export const InfoListSegmented = ({
  value = InfoStatus.PUBLISHED,
  onChange,
}: {
  value: InfoSegmentedValue;
  onChange: (value: InfoSegmentedValue) => void;
}) => {
  const { t } = useI18n();

  const options = [
    {
      label: t('actualites.info-list.segmented.published'),
      value: InfoStatus.PUBLISHED,
    },
    {
      label: t('actualites.info-list.segmented.draft'),
      value: InfoStatus.DRAFT,
    },
    {
      label: t('actualites.info-list.segmented.expired'),
      value: InfoExtendedStatus.EXPIRED,
    },
    {
      label: t('actualites.info-list.segmented.incoming'),
      value: InfoExtendedStatus.INCOMING,
    },
  ];

  return (
    <Segmented
      options={options}
      value={value}
      onChange={onChange}
      data-testid="info-list-segmented"
    />
  );
};
