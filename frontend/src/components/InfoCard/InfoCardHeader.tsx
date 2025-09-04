import { Avatar, Flex, useDate } from '@edifice.io/react';
import { useThread } from '~/features/threads/useThread';
import { SeparatedInfo } from '../SeparatedInfo';
import { ThreadCard } from '../ThreadCard';
import { InfoCardProps } from './InfoCard';

export const InfoCardHeader = ({ info }: Pick<InfoCardProps, 'info'>) => {
  const { formatDate } = useDate();
  const thread = useThread(info.threadId);

  return (
    <header>
      <Flex align="center" justify="between">
        <ThreadCard thread={thread}></ThreadCard>
        <h1>{info.title}</h1>
        <div>{/*TODO : flag *Nouveau */}</div>
      </Flex>

      <Flex align="center" gap="16" justify="around">
        <hr className="m-12 flex-fill" />
        <Flex gap="12" align="center" justify="around">
          <Avatar alt={info.owner.displayName} size="md" variant="circle" />
          <SeparatedInfo>
            <div>{info.owner.displayName}</div>
            <div>{formatDate(info.modified, 'long')}</div>
          </SeparatedInfo>
        </Flex>
        <hr className="m-12 flex-fill" />
      </Flex>
    </header>
  );
};
