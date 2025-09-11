import { Avatar, Flex, useDate, useDirectory } from '@edifice.io/react';
import { useThread } from '~/features/threads/useThread';
import { SeparatedInfo } from '../SeparatedInfo';
import { ThreadCard } from '../ThreadCard';
import { InfoCardProps } from './InfoCard';

export const InfoCardHeader = ({ info }: Pick<InfoCardProps, 'info'>) => {
  const { formatDate } = useDate();
  const thread = useThread(info.threadId);
  const { getAvatarURL } = useDirectory();
  const avatarUrl = getAvatarURL(info.owner.id, 'user');

  return (
    <header className="mb-12">
      <Flex align="center" justify="between">
        <ThreadCard thread={thread} textGray="700"></ThreadCard>
        <h2>{info.title}</h2>
        <div>Nouveau{/*TODO : flag Nouveau */}</div>
      </Flex>

      <Flex align="center" gap="16" justify="around">
        <hr className="m-12 ms-0 flex-fill" />
        <Flex gap="12" align="center" justify="around">
          <Avatar
            alt={info.owner.displayName}
            src={avatarUrl}
            size="md"
            variant="circle"
            loading="lazy"
          />
          <SeparatedInfo>
            <div>{info.owner.displayName}</div>
            <div>{formatDate(info.modified, 'long')}</div>
          </SeparatedInfo>
        </Flex>
        <hr className="m-12 me-0 flex-fill" />
      </Flex>
    </header>
  );
};
