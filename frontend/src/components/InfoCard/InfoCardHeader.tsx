import { Avatar, Flex, useDate, useDirectory } from '@edifice.io/react';
import { useThread } from '~/features/threads/useThread';
import { Divider } from '../Divider';
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
        <div>{/*TODO : flag Nouveau */}</div>
      </Flex>

      <Divider color="red">
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
      </Divider>
    </header>
  );
};
