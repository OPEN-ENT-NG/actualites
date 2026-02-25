import {
  AppIcon,
  AppIconSize,
  Flex,
  Image,
  useEdificeClient,
} from '@edifice.io/react';
import { IconHide } from '@edifice.io/react/icons';
import { Thread } from '~/models/thread';
import './ThreadIcon.css';

export const ThreadIcon = ({
  thread,
  iconSize = '32',
  hidden = false,
}: {
  thread?: Thread;
  iconSize?: AppIconSize;
  hidden?: boolean;
}) => {
  const { appCode } = useEdificeClient();

  const iconResized = thread?.icon?.includes('thumbnail')
    ? thread.icon
    : `${thread?.icon}?thumbnail=100x100`;

  return (
    <div className="position-relative">
      {thread?.icon ? (
        <div
          style={{
            width: parseInt(iconSize + ''),
            height: parseInt(iconSize + ''),
          }}
          className="overflow-hidden rounded flex-shrink-0 position-relative"
        >
          <Image
            src={iconResized}
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
      {hidden && (
        <Flex
          align="center"
          justify="center"
          className="thread-icon-hidden-overlay position-absolute top-0 start-0 w-100 h-100 rounded"
        >
          <IconHide height={32} width={32} />
        </Flex>
      )}
    </div>
  );
};
