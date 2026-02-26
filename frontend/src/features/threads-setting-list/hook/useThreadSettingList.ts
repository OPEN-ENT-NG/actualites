import { StringUtils } from '@edifice.io/client';
import { useDebounce } from '@edifice.io/react';
import {
  ChangeEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useI18n } from '~/hooks/useI18n';
import { InfoStatus } from '~/models/info';
import { Thread, ThreadListFilter } from '~/models/thread';
import {
  useInfosStats,
  useThreads,
  useUpdateThreadPreferences,
} from '~/services/queries';

export enum ThreadsSettingFilter {
  ALL = 'all',
  DISPLAYED = 'displayed',
  HIDDEN = 'hidden',
}

export function useThreadSettingList() {
  const { data: threads, isPending } = useThreads(ThreadListFilter.ALL);
  const { data: threadsStats } = useInfosStats({ viewHidden: true });
  const { mutateAsync: updateThreadPreferences } = useUpdateThreadPreferences();
  const { t } = useI18n();

  const [search, setSearch] = useState('');
  const [threadsFilter, setThreadsFilter] = useState(ThreadsSettingFilter.ALL);
  const [visibledThreads, setVisibledThreads] = useState<number[] | undefined>(
    undefined,
  );

  const filteredList = useMemo(() => {
    const normalizeString = (str: string) =>
      StringUtils.removeAccents(str.toLocaleLowerCase());

    return threads?.filter((thread) => {
      if (
        normalizeString(thread.title).includes(normalizeString(search)) ||
        normalizeString(thread.structure?.name || '').includes(
          normalizeString(search),
        )
      ) {
        if (threadsFilter === ThreadsSettingFilter.ALL) {
          return true;
        }
        if (threadsFilter === ThreadsSettingFilter.DISPLAYED) {
          return thread.visible;
        }
        return !thread.visible;
      }
      return false;
    });
  }, [threads, search, threadsFilter]);

  const checkAllStatus: 'all' | 'none' | 'indeterminate' = useMemo(() => {
    if (!filteredList) return 'none';
    const checkedCount = filteredList.filter((thread) =>
      visibledThreads?.includes(thread.id),
    ).length;
    if (checkedCount === 0) return 'none';
    if (checkedCount === filteredList.length) return 'all';
    return 'indeterminate';
  }, [visibledThreads, filteredList]);

  function getInfoCount(thread: Thread) {
    const stats = threadsStats?.threads?.find((t) => t.id === thread.id);
    return { count: stats?.status[InfoStatus.PUBLISHED] || 0 };
  }

  const debouncedCheckedThreads = useDebounce(visibledThreads, 600);

  useEffect(() => {
    if (!threads) return;
    setVisibledThreads(threads.filter((t) => t.visible).map((t) => t.id));
  }, [threads]);

  useLayoutEffect(() => {
    if (!threads || !debouncedCheckedThreads) return;

    // Check if there is a thread with visibility different from the checked state.
    // If there is no thread, that means there is no change and we can skip the update.
    const threadsUpdated = threads.filter((thread) => {
      const isVisible = debouncedCheckedThreads.includes(thread.id);
      return thread.visible !== isVisible;
    });
    if (threadsUpdated.length === 0) return;

    updateThreadPreferences({
      threads: threadsUpdated.map((thread) => ({
        threadId: thread.id,
        visible: debouncedCheckedThreads.includes(thread.id),
      })),
    });
  }, [debouncedCheckedThreads]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleAllCheckedChange = () => {
    if (!threads || !filteredList) return;
    setVisibledThreads((prev) => {
      if (!prev) return [...filteredList.map((thread) => thread.id)];
      const notIncludedThreads = filteredList
        .filter((thread) => !prev?.includes(thread.id))
        .map((thread) => thread.id);
      // If all threads are already included, uncheck from filtered list. Otherwise, check all.
      return notIncludedThreads.length > 0
        ? [...prev, ...notIncludedThreads]
        : [
            ...prev.filter(
              (id) => !filteredList.some((thread) => thread.id === id),
            ),
          ];
    });
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

  return {
    isLoading: isPending,
    checkAllStatus,
    filteredList,
    visibledThreads,
    threads,
    threadsFilter,
    threadsFilterCount,
    threadsFilterOptions,
    getInfoCount,
    handleAllCheckedChange,
    handleCheckedChange,
    handleSearchChange,
    setThreadsFilter,
  };
}
