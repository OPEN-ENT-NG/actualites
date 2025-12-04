import {
  Button,
  Dropdown,
  Flex,
  IconButton,
  IconButtonProps,
  SeparatedInfo,
  useBreakpoint,
} from '@edifice.io/react';
import {
  IconBulletList,
  IconDelete,
  IconEdit,
  IconTool,
} from '@edifice.io/react/icons';
import { RefAttributes } from 'react';
import { ThreadIcon } from '~/components/ThreadIcon';
import { useI18n } from '~/hooks/useI18n';
import { ThreadInfoStats } from '~/models/info';
import { Thread } from '~/models/thread';

export function AdminThread({
  thread,
  threadInfosStats,
}: {
  thread: Thread;
  threadInfosStats?: ThreadInfoStats;
}) {
  const { t } = useI18n();
  const { lg } = useBreakpoint();

  return (
    <Flex
      align="center"
      className="p-8 p-lg-12 admin-thread rounded"
      gap="24"
      fill
    >
      <ThreadIcon thread={thread} iconSize="80" />
      <Flex direction="column" gap="4" fill>
        <strong>{thread.title}</strong>
        <SeparatedInfo className="truncate">
          {thread.structureId && <span>{thread.structureId}</span>}
          <span>
            {t('actualites.adminThreads.threadInfoCount', {
              count: threadInfosStats?.incomingCount || 0,
            })}
          </span>
        </SeparatedInfo>
      </Flex>
      <Flex gap="4" className="col-3" align="center" justify="end">
        {lg ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              color="tertiary"
              leftIcon={<IconTool />}
            >
              {t('actualites.adminThreads.shareRightsButton')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              color="tertiary"
              leftIcon={<IconEdit />}
            >
              {t('actualites.adminThreads.editButton')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              color="tertiary"
              leftIcon={<IconDelete />}
            >
              {t('actualites.adminThreads.deleteButton')}
            </Button>
          </>
        ) : (
          <Dropdown>
            {(
              triggerProps: JSX.IntrinsicAttributes &
                Omit<IconButtonProps, 'ref'> &
                RefAttributes<HTMLButtonElement>,
            ) => (
              <>
                <IconButton
                  {...triggerProps}
                  type="button"
                  aria-label={t('actualites.adminThreads.threadActions')}
                  color="tertiary"
                  variant="ghost"
                  icon={<IconBulletList />}
                />
                <Dropdown.Menu>
                  <Dropdown.Item icon={<IconTool />}>
                    {t('actualites.adminThreads.shareRightsButton')}
                  </Dropdown.Item>
                  <Dropdown.Item icon={<IconEdit />}>
                    {t('actualites.adminThreads.editButton')}
                  </Dropdown.Item>
                  <Dropdown.Item icon={<IconDelete />}>
                    {t('actualites.adminThreads.deleteButton')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </>
            )}
          </Dropdown>
        )}
      </Flex>
    </Flex>
  );
}
