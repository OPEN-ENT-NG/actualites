import { AppIcon, Flex, Image, useEdificeClient } from '@edifice.io/react';
import clsx from 'clsx';
import { useMemo } from 'react';
import { Thread } from '~/models/thread';

export const ThreadCard = ({
  thread,
  className,
  textGray = '800',
}: {
  thread?: Thread;
  className?: string;
  textGray?: '700' | '800';
}) => {
  const { currentApp } = useEdificeClient();

  const { iconElement, title } = useMemo(
    () => ({
      iconElement: thread?.icon ? (
        <Image
          src={thread.icon}
          alt={title}
          width={32}
          height={32}
          objectFit="contain"
          loading="lazy"
        />
      ) : (
        <AppIcon app={currentApp} variant="square" size="32"></AppIcon>
      ),
      title: thread?.title ?? '',
    }),
    [thread],
  );

  const titleClass = clsx(
    'fs-3 lh-sm',
    textGray ? `text-gray-${textGray}` : '',
  );

  return (
    <Flex direction="row" align="center" gap="8" className={className}>
      {iconElement}
      <span className={titleClass}>{title}</span>
    </Flex>
  );
};
