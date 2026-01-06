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
import { Thread } from '~/models/thread';

export function AdminThread({
  thread,
  threadInfosCount,
  onUpdateClick,
  onDeleteClick,
  onShareClick,
}: {
  thread: Thread;
  threadInfosCount: { count: number };
  onUpdateClick: () => void;
  onDeleteClick: () => void;
  onShareClick: () => void;
}) {
  const { t } = useI18n();
  const { lg, xl } = useBreakpoint();

  return (
    <Flex
      data-testid="admin-thread-div"
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
          <div
            data-testid="admin-thread-div-structure-name"
            className={'text-truncate' + (!thread.structure && ' text-red-500')}
          >
            {thread.structure?.name || t('actualites.adminThreads.noStructure')}
          </div>
          {xl && <Divider vertical className="border-gray-700" />}
          <div
            data-testid="admin-thread-div-infos-count"
            className="text-nowrap"
          >
            {t('actualites.adminThreads.threadInfoCount', threadInfosCount)}
          </div>
        </Flex>
      </Flex>
      <Flex gap="4" align="center" justify="end">
        {lg ? (
          <>
            <Button
              data-testid="admin-thread-div-share-button"
              size="sm"
              variant="ghost"
              color="tertiary"
              leftIcon={<IconTool />}
              onClick={onShareClick}
              className="text-nowrap"
            >
              {t('actualites.adminThreads.shareRightsButton')}
            </Button>
            <Button
              data-testid="admin-thread-div-edit-button"
              size="sm"
              variant="ghost"
              color="tertiary"
              leftIcon={<IconEdit />}
              onClick={onUpdateClick}
            >
              {t('actualites.adminThreads.editButton')}
            </Button>
            <Button
              data-testid="admin-thread-div-delete-button"
              size="sm"
              variant="ghost"
              color="tertiary"
              leftIcon={<IconDelete />}
              onClick={onDeleteClick}
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
                  <Dropdown.Item icon={<IconTool />} onClick={onShareClick}>
                    {t('actualites.adminThreads.shareRightsButton')}
                  </Dropdown.Item>
                  <Dropdown.Item icon={<IconEdit />} onClick={onUpdateClick}>
                    {t('actualites.adminThreads.editButton')}
                  </Dropdown.Item>
                  <Dropdown.Item icon={<IconDelete />} onClick={onDeleteClick}>
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
