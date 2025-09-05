import { Button } from '@edifice.io/react';
import { useRef } from 'react';
import { useInfoList } from '~/features';
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll';
import { DEFAULT_PAGE_SIZE } from '~/services/queries/info';
import { InfoCard, InfoCardSkeleton } from '.';

export const InfoList = () => {
  const loadNextRef = useRef<HTMLElement>(null);

  const { infos, hasNextPage, loadNextPage, isLoading, reload } =
    useInfoList(DEFAULT_PAGE_SIZE);

  useInfiniteScroll({
    callback: () => {
      loadNextPage();
      return Promise.resolve();
    },
    elementRef: loadNextRef,
  });

  return (
    <div>
      <header className="mt-16 mb-24">
        <span>Mettre le Segmented Control ici =&gt; </span>
        <Button onClick={reload}>Recharger</Button>
      </header>

      {infos.map((info) => (
        <InfoCard key={info.id} info={info} variant="read"></InfoCard>
      ))}
      <br />
      {isLoading ? (
        <>
          <InfoCardSkeleton />
          <InfoCardSkeleton />
          <InfoCardSkeleton />
        </>
      ) : hasNextPage ? (
        <InfoCardSkeleton ref={loadNextRef} />
      ) : (
        <></>
      )}
    </div>
  );
};
