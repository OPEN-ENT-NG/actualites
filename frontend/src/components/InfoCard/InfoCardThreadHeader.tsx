import {
  AppIcon,
  Flex,
  Image,
  useBreakpoint,
  useEdificeClient,
} from '@edifice.io/react';
import { Thread } from '~/models/thread';

export const InfoCardThreadHeader = ({
  thread,
  className,
}: {
  thread?: Thread;
  className?: string;
}) => {
  const { appCode } = useEdificeClient();
  const { md } = useBreakpoint();

  const title = thread?.title || '';
  const iconSize = md ? '32' : '22';

  if (!thread) {
    return null;
  }

  return (
    <Flex
      direction="row"
      wrap="nowrap"
      align="center"
      gap="8"
      className={className}
      style={{ minWidth: '150px' }}
    >
      {thread?.icon ? (
        <Image
          src={thread.icon}
          alt={title}
          width={iconSize}
          height={iconSize}
          objectFit="contain"
          loading="lazy"
        />
      ) : (
        <AppIcon app={appCode} variant="square" size="32"></AppIcon>
      )}
      <span className="fs-5 text-truncate text-truncate-2 text-gray-700">
        {title}
      </span>
    </Flex>
  );
};
