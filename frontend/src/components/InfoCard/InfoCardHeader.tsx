import { Flex, useDate } from '@edifice.io/react';
import { useThread } from '~/features/threads/useThread';
import { SeparatedInfo } from '../SeparatedInfo';
import { ThreadCard } from '../ThreadCard';
import { InfoCardProps } from './InfoCard';

export const InfoCardHeader = ({ info }: InfoCardProps) => {
  const { formatDate } = useDate();
  const thread = useThread(info.threadId);

  return (
    <header>
      <Flex align="center" justify="between">
        <ThreadCard thread={thread}></ThreadCard>
        <h1>{info.title}</h1>
        <div>{/*TODO : nouveau*/}</div>
      </Flex>

      <SeparatedInfo>
        <div>{info.owner.displayName}</div>
        <div>{formatDate(info.modified, 'long')}</div>
      </SeparatedInfo>
    </header>
  );
};
