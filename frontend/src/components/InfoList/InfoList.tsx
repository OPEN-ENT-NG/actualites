import { Flex, useInfiniteScroll } from '@edifice.io/react';
import { useInfoList } from '~/hooks/useInfoList';
import { useInfoSearchParams } from '~/hooks/useInfoListParams';
import { InfoCard, InfoCardSkeleton } from '..';
import { InfoListEmpty } from './components/InfoListEmpty';
import { useInfoListEmptyScreen } from './hooks/useInfoListEmptyScreen';
import { InfoListSegmented } from './components/InfoListSegmented';

export const InfoList = () => {
  const { infos, hasNextPage, loadNextPage, isLoading } = useInfoList();
  const { type: emptyScreenType, isReady: emptyScreenIsReady } =
    useInfoListEmptyScreen();
  const { value, updateParams } = useInfoSearchParams();

  const loadNextRef = useInfiniteScroll({
    callback: loadNextPage,
  });

  return (
    <Flex
      direction="column"
      fill
      className="p-md-24 mt-16 mt-md-0 overflow-hidden me-n16 me-md-0 pe-16"
      gap="16"
    >
      <header>
        <InfoListSegmented
          value={value}
          onChange={(value) => {
            updateParams({ value });
          }}
        />
      </header>
      {!isLoading && infos.length === 0 && emptyScreenIsReady && (
        <InfoListEmpty type={emptyScreenType} />
      )}
      {infos.map((info) => (
        <InfoCard key={info.id} info={info}></InfoCard>
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
  );
};
