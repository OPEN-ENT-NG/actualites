import {
  AppIcon,
  Flex,
  Image,
  useBreakpoint,
  useEdificeClient,
} from '@edifice.io/react';
import clsx from 'clsx';
import { Thread } from '~/models/thread';

export const InfoCardThreadHeader = ({
  thread,
  className,
  textGray = '800',
}: {
  thread?: Thread;
  className?: string;
  textGray?: '700' | '800';
}) => {
  const { appCode } = useEdificeClient();
  const { md } = useBreakpoint();

  const titleClass = clsx(
    'fs-5 lh-sm text-truncate text-truncate-2',
    textGray ? `text-gray-${textGray}` : '',
  );
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
      <span className={titleClass}>{title}</span>
    </Flex>
  );
};
