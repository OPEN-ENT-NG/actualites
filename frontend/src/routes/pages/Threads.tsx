import { Flex, useBreakpoint } from '@edifice.io/react';
import { QueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { InfoList } from '~/components';
import { ThreadList } from '~/features/thread-list/ThreadList';

export const loader = (_queryClient: QueryClient) => async () => {
  return null;
};

export function Threads() {
  const [_searchParams] = useSearchParams();

  const { md } = useBreakpoint();

  return (
    <Flex fill direction={md ? 'row' : 'column'} className="col-12">
      <ThreadList />
      <InfoList />
    </Flex>
  );
}
