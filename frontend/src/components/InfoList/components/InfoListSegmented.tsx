import { SegmentedControl } from '@edifice.io/react';
import { useMemo } from 'react';
import { useInfoStats } from '~/components/InfoList/hooks/useInfoStats';
import { useI18n } from '~/hooks/useI18n';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import {
  InfoExtendedStatus,
  InfoSegmentedValue,
  InfoStatus,
} from '~/models/info';
import { useInfosStats } from '~/services/queries/info';

interface InfoListSegmentedOption {
  label: string;
  value: InfoSegmentedValue;
}
interface InfoListSegmentedProps {
  value: InfoSegmentedValue;
  onChange: (value: InfoSegmentedValue) => void;
}
export const InfoListSegmented = ({
  value = InfoStatus.PUBLISHED,
  onChange,
}: InfoListSegmentedProps) => {
  const { t } = useI18n();
  const { threadId } = useThreadInfoParams();
  const { data: infosStats } = useInfosStats();
  const threadInfosStats = useInfoStats(infosStats, threadId);

  const options = useMemo<InfoListSegmentedOption[]>(() => {
    const options: InfoListSegmentedOption[] = [
      {
        label: `${t('actualites.infoList.segmented.published')} ${threadInfosStats.status[InfoStatus.PUBLISHED]}`,
        value: InfoStatus.PUBLISHED,
      },
      {
        label: `${t('actualites.infoList.segmented.pending')} ${threadInfosStats.status[InfoStatus.PENDING]}`,
        value: InfoStatus.PENDING,
      },
    ];

    if (threadInfosStats.incomingCount > 0) {
      options.push({
        label: `${t('actualites.infoList.segmented.incoming')} ${threadInfosStats.incomingCount}`,
        value: InfoExtendedStatus.INCOMING,
      });
    }

    options.push({
      label: `${t('actualites.infoList.segmented.draft')} ${threadInfosStats.status[InfoStatus.DRAFT]}`,
      value: InfoStatus.DRAFT,
    });

    if (threadInfosStats.expiredCount > 0) {
      options.push({
        label: `${t('actualites.infoList.segmented.expired')} ${threadInfosStats.expiredCount}`,
        value: InfoExtendedStatus.EXPIRED,
      });
    }
    return options;
  }, [
    threadInfosStats.status,
    threadInfosStats.incomingCount,
    threadInfosStats.expiredCount,
  ]);

  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(value) => onChange(value as InfoSegmentedValue)}
      data-testid="info-list-segmented"
    />
  );
};
