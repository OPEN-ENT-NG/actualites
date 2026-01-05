import { AppIconSize, Flex, useBreakpoint } from '@edifice.io/react';
import { Thread } from '~/models/thread';
import { ThreadIcon } from '../ThreadIcon';

export const InfoCardThreadHeader = ({
  thread,
  className,
}: {
  thread?: Thread;
  className?: string;
}) => {
  const { md } = useBreakpoint();

  const title = thread?.title || '';
  const iconSize: AppIconSize = md ? '32' : '24';

  return (
    <Flex
      direction="row"
      wrap="nowrap"
      align="center"
      gap="8"
      className={className}
      style={{ minWidth: '150px' }}
    >
      <ThreadIcon thread={thread} iconSize={iconSize} />
      <span
        data-testid="info-thread-name"
        className="fs-5 text-truncate text-truncate-2 text-gray-700"
      >
        {title}
      </span>
    </Flex>
  );
};
