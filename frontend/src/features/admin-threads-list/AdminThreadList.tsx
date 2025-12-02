import { EmptyScreen, Flex } from '@edifice.io/react';
import illuEmptyAdminThreads from '@images/emptyscreen/illu-actualites.svg';
import { useI18n } from '~/hooks/useI18n';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';

import './AdminThreadList.css';

export function AdminThreadList() {
  const { threadsWithContributeRight } = useThreadsUserRights();
  const { t } = useI18n();

  if (!threadsWithContributeRight || threadsWithContributeRight.length === 0) {
    return (
      <EmptyScreen
        imageSrc={illuEmptyAdminThreads}
        imageAlt={t('actualites.admin-threads.empty.title')}
        title={t('actualites.admin-threads.empty.title')}
        text={t('actualites.admin-threads.empty.description')}
      />
    );
  }
  return <Flex direction="column" gap="16" fill></Flex>;
}
