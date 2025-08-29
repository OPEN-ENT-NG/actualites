import { LoadingScreen } from '@edifice.io/react';
import { useInfoList } from '~/features';
import { DEFAULT_PAGE_SIZE } from '~/services/queries/info';
import { InfoCard } from './InfoCard';

export const InfoList = () => {
  const { infos, hasMore, viewMore, isLoading, reload } =
    useInfoList(DEFAULT_PAGE_SIZE);

  return (
    <div>
      <header>
        <button onClick={reload}>Recharger</button>
      </header>
      {infos.map((info) => (
        <InfoCard info={info}></InfoCard>
      ))}
      <br />
      {isLoading ? (
        <LoadingScreen />
      ) : hasMore ? (
        <button onClick={viewMore}>Voir plus...</button>
      ) : (
        <></>
      )}
    </div>
  );
};
