import { Button, EmptyScreen, Flex, SearchBar } from '@edifice.io/react';
import illuEmptyAdminThreads from '@images/emptyscreen/illu-actualites.svg';
import { useI18n } from '~/hooks/useI18n';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';

import { StringUtils } from '@edifice.io/client';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { PortalModal } from '~/components/PortalModal';
import { InfoStatus } from '~/models/info';
import { Thread } from '~/models/thread';
import { useDeleteThread, useInfosStats } from '~/services/queries';
import './AdminThreadList.css';
import { AdminThread } from './components/AdminThread';
import AdminThreadModal from './components/AdminThreadModal';

export function AdminThreadList() {
  const { threadsWithManageRight } = useThreadsUserRights();
  const { t } = useI18n();
  const { data: infosStats } = useInfosStats();
  const { mutate: deleteThread } = useDeleteThread();

  const [search, setSearch] = useState('');
  const [threadToUpdate, setThreadToUpdate] = useState<Thread>();
  const [threadToDelete, setThreadToDelete] = useState<Thread>();

  const threadInfosStats = (threadId: number) => {
    return infosStats?.threads?.find((thread) => thread.id === threadId);
  };

  function getInfoCount(thread: Thread, state?: InfoStatus) {
    const stats = threadInfosStats(thread.id);
    let count = 0;
    if (stats) {
      [
        InfoStatus.TRASH,
        InfoStatus.DRAFT,
        InfoStatus.PENDING,
        InfoStatus.PUBLISHED,
      ].forEach((status) => {
        if (!state || state === status) count += stats.status[status];
      });
    }

    return {
      count,
    };
  }

  const filteredList = useMemo(() => {
    if (search === '') {
      return threadsWithManageRight;
    }

    const normalizeString = (str: string) =>
      StringUtils.removeAccents(str.toLocaleLowerCase());

    return threadsWithManageRight?.filter(
      (thread) =>
        normalizeString(thread.title).includes(normalizeString(search)) ||
        normalizeString(thread.structure?.name || '').includes(
          normalizeString(search),
        ),
    );
  }, [threadsWithManageRight, search]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCloseAdminThreadModal = () => {
    setThreadToUpdate(undefined);
  };

  const handleCloseDeleteModal = () => {
    setThreadToDelete(undefined);
  };

  const getDeletionText = useCallback(() => {
    if (threadToDelete) {
      const textParameter = getInfoCount(threadToDelete);
      switch (textParameter.count) {
        case 0:
          return t('actualites.adminThreads.modal.delete.paragraph.none');
        case 1:
          return t('actualites.adminThreads.modal.delete.paragraph.one');
        default:
          return t(
            'actualites.adminThreads.modal.delete.paragraph.many',
            textParameter,
          );
      }
    }
    return t('actualites.adminThreads.modal.delete.paragraph');
  }, [threadToDelete]);

  const handleDeleteClick = useCallback(() => {
    if (threadToDelete) {
      deleteThread(threadToDelete.id);
    }
    setThreadToDelete(undefined);
  }, [threadToDelete]);

  if (!threadsWithManageRight || threadsWithManageRight.length === 0) {
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
            threadInfosCount={getInfoCount(thread, InfoStatus.PUBLISHED)}
            onUpdateClick={() => setThreadToUpdate(thread)}
            onDeleteClick={() => setThreadToDelete(thread)}
          />
        );
      })}

      {threadToUpdate && (
        <AdminThreadModal
          isOpen={!!threadToUpdate}
          thread={threadToUpdate}
          onCancel={handleCloseAdminThreadModal}
          onSuccess={handleCloseAdminThreadModal}
        />
      )}

      {threadToDelete && (
        <PortalModal
          id="modal-thread-delete"
          isOpen={!!threadToDelete}
          onModalClose={handleCloseDeleteModal}
          size={'sm'}
          header={t('actualites.adminThreads.modal.delete.title')}
          footer={
            <>
              <Button
                variant="ghost"
                color="tertiary"
                onClick={handleCloseDeleteModal}
              >
                {t('actualites.adminThreads.modal.cancel')}
              </Button>
              <Button color="danger" onClick={handleDeleteClick}>
                {t('actualites.adminThreads.modal.delete')}
              </Button>
            </>
          }
        >
          {getDeletionText()}
        </PortalModal>
      )}
    </Flex>
  );
}
