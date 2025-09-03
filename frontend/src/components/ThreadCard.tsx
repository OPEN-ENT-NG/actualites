import { AppIcon, Flex, Image, useEdificeClient } from '@edifice.io/react';
import { useMemo } from 'react';
import { Thread } from '~/models/thread';

export const ThreadCard = ({ thread }: { thread?: Thread }) => {
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
        />
      ) : (
        <AppIcon app={currentApp}></AppIcon>
      ),
      title: thread?.title ?? '',
    }),
    [thread],
  );

  return (
    <Flex direction="row" align="center" gap="8">
      {iconElement}
      <span className="text-gray-700">{title}</span>
    </Flex>
  );
};
