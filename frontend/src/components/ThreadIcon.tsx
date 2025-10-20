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
        <div
          style={{
            width: parseInt(iconSize + ''),
            height: parseInt(iconSize + ''),
          }}
          className="overflow-hidden rounded"
        >
          <Image
            src={thread.icon}
            alt={thread.title}
            style={{
              height: '100%',
              width: '100%',
            }}
            objectFit="cover"
            loading="lazy"
          />
        </div>
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
