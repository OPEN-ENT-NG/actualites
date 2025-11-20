import { Segmented } from 'antd';
import { useMemo } from 'react';
import { useI18n } from '~/hooks/useI18n';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { InfoSegmentedValue, InfoStatus, ThreadInfoStats } from '~/models/info';
import { ThreadId } from '~/models/thread';
import { useInfosStats } from '~/services/queries/info';

const defailtInfoStats = (threadId: ThreadId): ThreadInfoStats => {
  return {
    id: threadId,
    status: {
      [InfoStatus.PUBLISHED]: 0,
      [InfoStatus.DRAFT]: 0,
      [InfoStatus.TRASH]: 0,
      [InfoStatus.PENDING]: 0,
    },
    expiredCount: 0,
    incomingCount: 0,
  };
};

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
  const threadInfosStats = useMemo(
    () =>
      infosStats?.threads?.find((thread) => thread.id === threadId) ??
      defailtInfoStats(threadId || 0),
    [infosStats, threadId],
  );

  const options = [
    {
      label:
        t('actualites.info-list.segmented.published') +
        ' ' +
        (threadInfosStats?.status[InfoStatus.PUBLISHED] ?? 0),
      value: InfoStatus.PUBLISHED,
    },
    {
      label:
        t('actualites.info-list.segmented.draft') +
        ' ' +
        (threadInfosStats?.status[InfoStatus.DRAFT] ?? 0),
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
