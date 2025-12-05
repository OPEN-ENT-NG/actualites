import { Flex, useInfiniteScroll } from '@edifice.io/react';
import { useEffect, useMemo, useRef } from 'react';
import { useInfoList } from '~/hooks/useInfoList';
import { useInfoSearchParams } from '~/hooks/useInfoSearchParams';
import { useScrollToElement } from '~/hooks/useScrollToElement';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { InfoId } from '~/models/info';
import { useInfosStats } from '~/services/queries/info';
import { InfoCard, InfoCardSkeleton } from '..';
import { InfoModal } from '../InfoModal/InfoModal';
import { InfoListEmpty } from './components/InfoListEmpty';
import { InfoListSegmented } from './components/InfoListSegmented';
import { InfoListSegmentedSkeleton } from './components/InfoListSegmentedSkeleton';
import { useInfoListEmptyScreen } from './hooks/useInfoListEmptyScreen';

export const InfoList = () => {
  const { infos, hasNextPage, loadNextPage, isLoading } = useInfoList();
  const { type: emptyScreenType, isReady: emptyScreenIsReady } =
    useInfoListEmptyScreen();
  const { value, updateParams } = useInfoSearchParams();
  const { threadId } = useThreadInfoParams();
  const { hasContributeRightOnThread } = useThreadsUserRights();
  const isSegmentedVisible = hasContributeRightOnThread?.(threadId);
  const { isLoading: isInfosStatsLoading } = useInfosStats({
    enabled: !!isSegmentedVisible,
  });

  const loadNextRef = useInfiniteScroll({
    callback: loadNextPage,
  });

  const scrollToElementId = useRef<string>();

  // Check for info ID in URL fragment
  const { hash, scrollIntoView } = useScrollToElement();
  const optionalInfoModal = useMemo(() => {
    // If an hash exists, wait for first page of infos to be loaded.
    if (hash.startsWith('info-') && infos.length > 0) {
      // If info is found in the list...
      if (infos.findIndex((info) => `info-${info.id}` === hash) >= 0) {
        // ...memoize to scroll to its corresponding HTML element as a side-effect.
        scrollToElementId.current = hash;
      }
      // Then open a modal to display it.
      const infoId: InfoId = Number(hash.slice(5));
      return <InfoModal infoId={infoId} />;
    }
    return null;
  }, [infos.length]);

  useEffect(() => {
    scrollToElementId.current && scrollIntoView(scrollToElementId.current);
  }, [scrollToElementId.current]);

  return (
    <>
      <Flex
        direction="column"
        fill
        className="p-md-24 mt-16 mt-md-0 overflow-hidden me-n16 me-md-0 pe-16"
        gap="16"
      >
        {isSegmentedVisible && (
          <header className="align-self-center">
            {isInfosStatsLoading ? (
              <InfoListSegmentedSkeleton />
            ) : (
              <InfoListSegmented
                value={value}
                onChange={(value) => {
                  updateParams({ value });
                }}
              />
            )}
          </header>
        )}
        {!isLoading && infos.length === 0 && emptyScreenIsReady && (
          <InfoListEmpty type={emptyScreenType} />
        )}
        {infos.map((info) => (
          <InfoCard id={`info-${info.id}`} key={info.id} info={info}></InfoCard>
        ))}
        {isLoading ? (
          <>
            <InfoCardSkeleton />
            <InfoCardSkeleton />
            <InfoCardSkeleton />
          </>
        ) : (
          hasNextPage && <InfoCardSkeleton ref={loadNextRef} />
        )}
      </Flex>
      {optionalInfoModal}
    </>
  );
};
