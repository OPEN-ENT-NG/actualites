import { SegmentedControl } from '@edifice.io/react';
import { useInfoStats } from '~/components/InfoList/hooks/useInfoStats';
import { useI18n } from '~/hooks/useI18n';
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
      label: `${t('actualites.infoList.segmented.published')} ${threadInfosStats.status[InfoStatus.PUBLISHED]}`,
      value: InfoStatus.PUBLISHED,
    },
    {
      label: `${t('actualites.infoList.segmented.draft')} ${threadInfosStats.status[InfoStatus.DRAFT]}`,
      value: InfoStatus.DRAFT,
    },
    // TODO: add expired and incoming stats
    // {
    //   label:
    //     t('actualites.infoList.segmented.expired') +
    //     ' ' +
    //     (threadInfosStats?.expiredCount ?? 0),
    //   value: InfoExtendedStatus.EXPIRED,
    // },
    // {
    //   label:
    //     t('actualites.infoList.segmented.incoming') +
    //     ' ' +
    //     (threadInfosStats?.incomingCount ?? 0),
    //   value: InfoExtendedStatus.INCOMING,
    // },
  ];

  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(value) => onChange(value as InfoSegmentedValue)}
      data-testid="info-list-segmented"
    />
  );
};
