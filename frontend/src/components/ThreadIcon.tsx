import {
  AppIcon,
  AppIconSize,
  Image,
  useEdificeClient,
} from '@edifice.io/react';
import { Thread } from '~/models/thread';

export const ThreadIcon = ({
  thread,
  iconSize = '32',
}: {
  thread?: Thread;
  iconSize?: AppIconSize;
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
