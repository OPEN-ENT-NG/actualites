import {
  Button,
  Divider,
  Dropdown,
  Flex,
  IconButton,
  IconButtonProps,
  useBreakpoint,
} from '@edifice.io/react';
import {
  IconDelete,
  IconEdit,
  IconOptions,
  IconTool,
} from '@edifice.io/react/icons';
import { RefAttributes } from 'react';
import { ThreadIcon } from '~/components/ThreadIcon';
import { useI18n } from '~/hooks/useI18n';
import { InfoStatus, ThreadInfoStats } from '~/models/info';
import { Thread } from '~/models/thread';

export function AdminThread({
  thread,
  threadInfosStats,
}: {
  thread: Thread;
  threadInfosStats?: ThreadInfoStats;
}) {
  const { t } = useI18n();
  const { lg, xl } = useBreakpoint();

  return (
    <Flex
      align="center"
      className="p-8 p-lg-12 admin-thread rounded"
      gap="24"
      fill
    >
      <ThreadIcon thread={thread} iconSize="80" />
      <Flex direction="column" gap="4" fill className="overflow-hidden">
        <strong className="text-truncate">{thread.title}</strong>

        <Flex
          direction={xl ? 'row' : 'column'}
          align={xl ? 'center' : 'start'}
          wrap="nowrap"
          className="text-gray-700 "
        >
          {thread.structure?.name && (
            <>
              <div className="text-truncate">{thread.structure.name}</div>
              {xl && <Divider vertical className="border-gray-700" />}
            </>
          )}
          <div className="text-nowrap">
            {t('actualites.adminThreads.threadInfoCount', {
              count: threadInfosStats?.status[InfoStatus.PUBLISHED] || 0,
            })}
          </div>
        </Flex>
      </Flex>
      <Flex gap="4" align="center" justify="end">
        {lg ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              color="tertiary"
              leftIcon={<IconTool />}
              className="text-nowrap"
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
                  icon={<IconOptions />}
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
