import { AppIcon, Image, useEdificeClient } from '@edifice.io/react';
import { AppIconSize } from 'node_modules/@edifice.io/react/dist/components/AppIcon/AppIcon';
import { Thread } from '~/models/thread';

export const ThreadIcon = ({
  thread,
  iconSize = 32,
}: {
  thread?: Thread;
  iconSize?: number;
}) => {
  const { appCode } = useEdificeClient();

  return (
    <>
      {thread?.icon ? (
        <Image
          src={thread.icon}
          alt={thread.title}
          width={iconSize}
          height={iconSize}
          objectFit="contain"
          loading="lazy"
        />
      ) : (
        <AppIcon
          app={appCode}
          variant="square"
          size={(iconSize + '') as AppIconSize}
        ></AppIcon>
      )}
    </>
  );
};
