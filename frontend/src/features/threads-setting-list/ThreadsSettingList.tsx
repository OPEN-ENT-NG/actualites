import {
  Checkbox,
  EmptyScreen,
  Flex,
  SearchBar,
  SegmentedControl,
  useDebounce,
} from '@edifice.io/react';
import illuEmptyAdminThreads from '@images/emptyscreen/illu-actualites.svg';
import { useI18n } from '~/hooks/useI18n';

import { StringUtils } from '@edifice.io/client';
import {
  ChangeEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { InfoStatus } from '~/models/info';
import { Thread } from '~/models/thread';
import {
  useInfosStats,
  useThreads,
  useUpdateThreadPreferences,
} from '~/services/queries';
import './ThreadsSettingList.css';
import { ThreadSetting } from './components/ThreadsSetting';

enum ThreadsSettingFilter {
  ALL = 'all',
  DISPLAYED = 'displayed',
  HIDDEN = 'hidden',
}

export function ThreadsSettingList() {
  const { data: threads, isPending } = useThreads(true);
  const { t } = useI18n();
  const { data: threadsStats } = useInfosStats({ viewHidden: true });
  const { mutateAsync: updateThreadPreferences } = useUpdateThreadPreferences();

  const [search, setSearch] = useState('');
  const [threadsFilter, setThreadsFilter] = useState(ThreadsSettingFilter.ALL);
  const [visibledThreads, setVisibledThreads] = useState<number[] | undefined>(
    undefined,
  );
  const isAllChecked = useMemo(() => {
    if (!threads) return false;
    return visibledThreads?.length === threads.length;
  }, [visibledThreads, threads]);

  function getInfoCount(thread: Thread) {
    const stats = threadsStats?.threads?.find((t) => t.id === thread.id);
    return { count: stats?.status[InfoStatus.PUBLISHED] || 0 };
  }

  const filteredList = useMemo(() => {
    const normalizeString = (str: string) =>
      StringUtils.removeAccents(str.toLocaleLowerCase());

    return threads?.filter((thread) => {
      if (
        !(
          normalizeString(thread.title).includes(normalizeString(search)) ||
          normalizeString(thread.structure?.name || '').includes(
            normalizeString(search),
          )
        )
      ) {
        return false;
      }
      if (threadsFilter === ThreadsSettingFilter.ALL) {
        return true;
      }
      if (threadsFilter === ThreadsSettingFilter.DISPLAYED) {
        return thread.visible;
      }
      return !thread.visible;
    });
  }, [threads, search, threadsFilter]);

  const debouncedCheckedThreads = useDebounce(visibledThreads, 600);

  useEffect(() => {
    if (!threads) return;
    setVisibledThreads(threads.filter((t) => t.visible).map((t) => t.id));
  }, [threads]);

  useLayoutEffect(() => {
    if (!threads || !debouncedCheckedThreads) return;

    // Compare the current visible threads with the debounced checked threads
    const currentVisibleThreads = threads
      .filter((t) => t.visible)
      .map((t) => t.id);
    const areArraysEqual =
      currentVisibleThreads.length === debouncedCheckedThreads.length &&
      !currentVisibleThreads.some(
        (value) => !debouncedCheckedThreads.includes(value),
      );
    // Skip update if arrays are equal that means no changes have been made
    if (areArraysEqual) return;

    updateThreadPreferences({
      threads: threads.map((thread) => ({
        threadId: thread.id,
        visible: debouncedCheckedThreads.includes(thread.id),
      })),
    });
  }, [debouncedCheckedThreads]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleAllCheckedChange = () => {
    if (!threads) return;
    setVisibledThreads((prev) =>
      prev?.length === threads.length ? [] : [...threads!.map((t) => t.id)],
    );
  };

  const handleCheckedChange = (threadId: number, checked: boolean) => {
    if (checked) {
      setVisibledThreads((prev) => [...(prev || []), threadId]);
    } else {
      setVisibledThreads((prev) => prev?.filter((id) => id !== threadId));
    }
  };

  const threadsFilterCount = useMemo(() => {
    const count: Record<ThreadsSettingFilter, number> = {
      [ThreadsSettingFilter.ALL]: threads?.length || 0,
      [ThreadsSettingFilter.DISPLAYED]: threads
        ? threads.filter((thread) => thread.visible).length
        : 0,
      [ThreadsSettingFilter.HIDDEN]: threads
        ? threads.filter((thread) => !thread.visible).length
        : 0,
    };
    return count;
  }, [threads]);

  const threadsFilterOptions = useMemo(
    () => [
      {
        label: `${t('actualites.threadsSetting.segmented.all', { count: threadsFilterCount[ThreadsSettingFilter.ALL] })}`,
        value: ThreadsSettingFilter.ALL,
      },
      {
        label: `${t('actualites.threadsSetting.segmented.displayed', { count: threadsFilterCount[ThreadsSettingFilter.DISPLAYED] })}`,
        value: ThreadsSettingFilter.DISPLAYED,
      },
      {
        label: `${t('actualites.threadsSetting.segmented.hidden', { count: threadsFilterCount[ThreadsSettingFilter.HIDDEN] })}`,
        value: ThreadsSettingFilter.HIDDEN,
      },
    ],
    [threadsFilterCount],
  );

  if (!isPending && threads?.length === 0) {
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
    <Flex direction="column" gap="16" className="w-100 pb-40 pb-lg-0">
      <Flex justify="center">
        <SearchBar
          data-testid="admin-thread-search-input"
          className="col-12 col-lg-8"
          placeholder={t('actualites.adminThreads.searchPlaceholder')}
          isVariant
          onChange={handleSearchChange}
        />
      </Flex>
      <Flex align="center" justify="between">
        <SegmentedControl
          options={threadsFilterOptions}
          value={threadsFilter}
          onChange={(value) => setThreadsFilter(value as ThreadsSettingFilter)}
          data-testid="threads-list-segmented"
        ></SegmentedControl>

        <Checkbox
          label={t('actualites.threadsSetting.displayThreadAll')}
          onChange={handleAllCheckedChange}
          checked={isAllChecked}
        />
      </Flex>

      {filteredList?.map((thread) => {
        return (
          <ThreadSetting
            key={thread.id}
            thread={thread}
            threadInfosCount={getInfoCount(thread)}
            checked={
              visibledThreads ? visibledThreads.includes(thread.id) : true
            }
            onCheckedChange={(checked) =>
              handleCheckedChange(thread.id, checked)
            }
          />
        );
      })}
    </Flex>
  );
}
