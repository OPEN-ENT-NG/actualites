import { Checkbox, Divider, Flex, useBreakpoint } from '@edifice.io/react';
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

  const handleCheckClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange(e.currentTarget.checked);
  };

  return (
    <Flex
      data-testid="thread-div"
      align="center"
      className="p-8 p-lg-12 thread rounded"
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
          fill
        >
          <div
            data-testid="thread-div-structure-name"
            className={'text-truncate' + (!thread.structure && ' text-red-500')}
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
        />
      </Flex>
    </Flex>
  );
}
