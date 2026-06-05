import {
  Alert,
  Checkbox,
  Divider,
  EmptyScreen,
  Flex,
  SearchBar,
  SegmentedControl,
} from '@edifice.io/react';
import illuEmptyAdminThreads from '@images/emptyscreen/illu-actualites.svg';

import { useI18n } from '~/hooks/useI18n';
import './ThreadsSettingList.css';
import { ThreadSetting } from './components/ThreadSetting';
import {
  ThreadsSettingFilter,
  useThreadSettingList,
} from './hook/useThreadSettingList';

export function ThreadsSettingList() {
  const {
    filteredList,
    checkAllStatus,
    isLoading,
    visibledThreads,
    threads,
    threadsFilter,
    threadsFilterOptions,
    handleAllCheckedChange,
    handleCheckedChange,
    handleSearchChange,
    setThreadsFilter,
    getInfoCount,
  } = useThreadSettingList();
  const { t } = useI18n();

  if (!isLoading && threads?.length === 0) {
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
      <Flex justify="center" className="mb-32">
        <SearchBar
          data-testid="admin-thread-search-input"
          className="col-12 col-lg-8"
          placeholder={t('actualites.adminThreads.searchPlaceholder')}
          isVariant
          onChange={handleSearchChange}
        />
      </Flex>
      <Alert
        type="info"
        title={t('actualites.threadsSetting.info.title')}
        isDismissible
      >
        <>
          <div>
            <strong>{t('actualites.threadsSetting.info.title')}</strong>
          </div>
          {t('actualites.threadsSetting.info.description')}
        </>
      </Alert>
      <Flex align="center" justify="between" className="px-8 px-lg-12">
        <SegmentedControl
          options={threadsFilterOptions}
          value={threadsFilter}
          variant="ghost"
          onChange={(value) => setThreadsFilter(value as ThreadsSettingFilter)}
          data-testid="threads-list-segmented"
        />

        <Checkbox
          label={t('actualites.threadsSetting.displayThreadAll')}
          onChange={handleAllCheckedChange}
          checked={checkAllStatus === 'all'}
          indeterminate={checkAllStatus === 'indeterminate'}
          data-testid="threads-list-check-all"
        />
      </Flex>
      <Divider className="m-0" />
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
      {filteredList?.length === 0 && (
        <EmptyScreen
          imageSrc={illuEmptyAdminThreads}
          imageAlt={t('actualites.adminThreads.empty.title')}
          title={t('actualites.adminThreads.searchEmpty.title')}
          text={t('actualites.adminThreads.searchEmpty.description')}
        />
      )}
    </Flex>
  );
}
