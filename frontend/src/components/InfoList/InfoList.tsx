import { Button, Flex, useInfiniteScroll } from '@edifice.io/react';
import { useInfoList } from '~/hooks/useInfoList';
import { InfoCard, InfoCardSkeleton } from '..';
import { InfoListEmpty } from './components/InfoListEmpty';
import { useInfoListEmptyScreen } from './hooks/useInfoListEmptyScreen';

export const InfoList = () => {
  const { infos, hasNextPage, loadNextPage, isLoading, reload } = useInfoList();
  const { type: emptyScreenType, isReady: emptyScreenIsReady } =
    useInfoListEmptyScreen();

  const loadNextRef = useInfiniteScroll({
    callback: loadNextPage,
  });

  return (
    <Flex
      direction="column"
      fill
      className="p-md-24 mt-16 mt-md-0 overflow-hidden"
      gap="16"
    >
      <header>
        <span>Mettre le Segmented Control ici =&gt; </span>
        <Button onClick={reload}>Recharger</Button>
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
