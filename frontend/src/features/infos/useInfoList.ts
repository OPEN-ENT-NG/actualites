import { useEffect, useState } from 'react';
import { Info } from '~/models/info';
import { queryClient } from '~/providers';
import { infoQueryKeys, useInfos } from '~/services/queries/info';

export function useInfoList(pageSize: number) {
  const [infos, setInfos] = useState([] as Array<Info>);
  const [page, setPage] = useState(0);

  const infosQuery = useInfos(page, pageSize);

  useEffect(() => {
    if (infosQuery.data) {
      setInfos((previous) => previous.concat(infosQuery.data));
    }
  }, [infosQuery.data]);

  return {
    infos,
    hasNextPage: infosQuery.data && infosQuery.data.length >= pageSize,
    loadNextPage: () => {
      setPage((previous) => previous + 1);
    },
    isLoading: infosQuery.isLoading,
    reload: () => {
      setInfos([]);
      setPage(0);
      queryClient.invalidateQueries({ queryKey: infoQueryKeys.all({}) });
    },
  };
}
