import { Segmented } from 'antd';
import { useMemo } from 'react';
import { useI18n } from '~/hooks/useI18n';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import {
  InfoSegmentedValue,
  InfoStatus,
  InfosStats,
  ThreadInfoStats,
} from '~/models/info';
import { ThreadId } from '~/models/thread';
import { useInfosStats } from '~/services/queries/info';

const defaultInfoStats = (threadId?: ThreadId): ThreadInfoStats => {
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

const calculateTotalStats = (
  infosStats: InfosStats | undefined,
): ThreadInfoStats => {
  return (
    infosStats?.threads?.reduce(
      (acc, thread) => ({
        id: undefined,
        status: {
          [InfoStatus.PUBLISHED]:
            acc.status[InfoStatus.PUBLISHED] +
            thread.status[InfoStatus.PUBLISHED],
          [InfoStatus.DRAFT]:
            acc.status[InfoStatus.DRAFT] + thread.status[InfoStatus.DRAFT],
          [InfoStatus.TRASH]:
            acc.status[InfoStatus.TRASH] + thread.status[InfoStatus.TRASH],
          [InfoStatus.PENDING]:
            acc.status[InfoStatus.PENDING] + thread.status[InfoStatus.PENDING],
        },
        expiredCount: acc.expiredCount + thread.expiredCount,
        incomingCount: acc.incomingCount + thread.incomingCount,
      }),
      defaultInfoStats(undefined),
    ) ?? defaultInfoStats(undefined)
  );
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

  const totalStats = useMemo(
    () => calculateTotalStats(infosStats),
    [infosStats],
  );

  const threadInfosStats = useMemo(() => {
    if (!threadId) {
      return totalStats;
    }

    const threadInfoStats = infosStats?.threads?.find(
      (thread) => thread.id === threadId,
    );
    return threadInfoStats ?? defaultInfoStats(threadId);
  }, [infosStats, threadId, totalStats]);

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
