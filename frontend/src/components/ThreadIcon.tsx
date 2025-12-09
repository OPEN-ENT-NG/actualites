import {
  AppIcon,
  AppIconSize,
  Flex,
  Image,
  useEdificeClient,
} from '@edifice.io/react';
import { Thread } from '~/models/thread';
import './ThreadIcon.css';

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
          className="overflow-hidden rounded flex-shrink-0"
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
        <Flex
          align="center"
          justify="center"
          className="bg-orange-200 rounded thread-icon"
        >
          <AppIcon app={appCode} variant="square" size={iconSize} />
        </Flex>
      )}
    </>
  );
};
