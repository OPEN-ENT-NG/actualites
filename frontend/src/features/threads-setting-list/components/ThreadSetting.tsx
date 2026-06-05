import {
  Checkbox,
  Divider,
  Flex,
  useBreakpoint,
  useEdificeClient,
} from '@edifice.io/react';
import { clsx } from 'clsx';
import { ChangeEvent } from 'react';
import { ThreadIcon } from '~/components/ThreadIcon';
import { useI18n } from '~/hooks/useI18n';
import { Thread } from '~/models/thread';

export function ThreadSetting({
  thread,
  threadInfosCount,
  checked,
  onCheckedChange,
}: {
  thread: Thread;
  threadInfosCount: { count: number };
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const { t } = useI18n();
  const { xl } = useBreakpoint();
  const { user } = useEdificeClient();

  const handleCheckClick = (e: ChangeEvent<HTMLInputElement>) => {
    onCheckedChange(e.currentTarget.checked);
  };

  const classes = clsx('overflow-hidden', {
    'opacity-50': !checked,
  });

  const userRole: string =
    thread.owner.id === user?.userId
      ? 'owner'
      : thread.sharedRights?.includes('thread.manager')
        ? 'manager'
        : thread.sharedRights?.includes('thread.publish')
          ? 'publish'
          : thread.sharedRights?.includes('thread.contrib')
            ? 'contributor'
            : 'read';

  return (
    <Flex
      data-testid="thread-div"
      align="center"
      className="p-8 p-lg-12 thread rounded"
      gap="24"
      fill
    >
      <ThreadIcon thread={thread} iconSize="80" hidden={!checked} />
      <Flex direction="column" gap="4" fill className={classes}>
        <strong className="text-truncate">{thread.title}</strong>
        <div>{t(`actualites.threadsSetting.rights.${userRole}`)}</div>
        <Flex
          direction={xl ? 'row' : 'column'}
          align={xl ? 'center' : 'start'}
          wrap="nowrap"
          className="text-gray-700 "
          fill
        >
          <div
            data-testid="thread-div-structure-name"
            className={`text-truncate${!thread.structure ? ' text-red-500' : ''}`}
          >
            {thread.structure?.name || t('actualites.adminThreads.noStructure')}
          </div>
          {xl && <Divider vertical className="border-gray-700" />}
          <div data-testid="thread-div-infos-count" className="text-nowrap">
            {t('actualites.adminThreads.threadInfoCount', threadInfosCount)}
          </div>
        </Flex>
      </Flex>
      <Flex align="center" className="">
        <Checkbox
          label={t('actualites.threadsSetting.displayThread')}
          onChange={handleCheckClick}
          checked={checked}
          data-testid={`thread-${thread.id}-checkbox`}
        />
      </Flex>
    </Flex>
  );
}
