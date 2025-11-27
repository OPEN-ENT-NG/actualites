import { Segmented } from 'antd';
import { useI18n } from '~/hooks/useI18n';
import { useInfoStats } from '~/components/InfoList/hooks/useInfoStats';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { InfoSegmentedValue, InfoStatus } from '~/models/info';
import { useInfosStats } from '~/services/queries/info';

export const InfoListSegmented = ({
  value = InfoStatus.PUBLISHED,
  onChange,
}: {
  value: InfoSegmentedValue;
  onChange: (value: InfoSegmentedValue) => void;
}) => {
  const { t } = useI18n();
  const { threadId } = useThreadInfoParams();
  const { data: infosStats } = useInfosStats();

  const threadInfosStats = useInfoStats(infosStats, threadId);

  const options = [
    {
      label: `${t('actualites.info-list.segmented.published')} ${threadInfosStats.status[InfoStatus.PUBLISHED]}`,
      value: InfoStatus.PUBLISHED,
    },
    {
      label: `${t('actualites.info-list.segmented.draft')} ${threadInfosStats.status[InfoStatus.DRAFT]}`,
      value: InfoStatus.DRAFT,
    },
    // TODO: add expired and incoming stats
    // {
    //   label:
    //     t('actualites.info-list.segmented.expired') +
    //     ' ' +
    //     (threadInfosStats?.expiredCount ?? 0),
    //   value: InfoExtendedStatus.EXPIRED,
    // },
    // {
    //   label:
    //     t('actualites.info-list.segmented.incoming') +
    //     ' ' +
    //     (threadInfosStats?.incomingCount ?? 0),
    //   value: InfoExtendedStatus.INCOMING,
    // },
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
