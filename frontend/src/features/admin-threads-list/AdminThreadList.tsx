import { EmptyScreen, Flex, SearchBar } from '@edifice.io/react';
import illuEmptyAdminThreads from '@images/emptyscreen/illu-actualites.svg';
import { useI18n } from '~/hooks/useI18n';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';

import { ChangeEvent, useMemo, useState } from 'react';
import { useInfosStats } from '~/services/queries';
import './AdminThreadList.css';
import { AdminThread } from './components/AdminThread';

export function AdminThreadList() {
  const { threadsWithContributeRight } = useThreadsUserRights();
  const { t } = useI18n();
  const { data: infosStats } = useInfosStats();

  const [search, setSearch] = useState('');

  const threadInfosStats = (threadId: number) => {
    return infosStats?.threads?.find((thread) => thread.id === threadId);
  };

  const filteredList = useMemo(() => {
    if (search === '') {
      return threadsWithContributeRight;
    }
    return threadsWithContributeRight?.filter((thread) =>
      thread.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    );
  }, [threadsWithContributeRight, search]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  if (!threadsWithContributeRight || threadsWithContributeRight.length === 0) {
    return (
      <EmptyScreen
        imageSrc={illuEmptyAdminThreads}
        imageAlt={t('actualites.adminThreads.empty.title')}
        title={t('actualites.adminThreads.empty.title')}
        text={t('actualites.adminThreads.empty.description')}
      />
    );
  }
  return (
    <Flex direction="column" gap="16" className="w-100">
      <Flex justify="center">
        <SearchBar
          className="col-12 col-lg-8"
          placeholder={t('actualites.adminThreads.searchPlaceholder')}
          isVariant
          onChange={handleSearchChange}
        />
      </Flex>
      {filteredList?.map((thread) => {
        return (
          <AdminThread
            key={thread.id}
            thread={thread}
            threadInfosStats={threadInfosStats(thread.id)}
          />
        );
      })}
    </Flex>
  );
}
