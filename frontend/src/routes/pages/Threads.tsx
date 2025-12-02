import { Grid } from '@edifice.io/react';
import { QueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { InfoList } from '~/components';
import { ThreadList } from '~/features/thread-list/ThreadList';

export const loader = (_queryClient: QueryClient) => async () => {
  return null;
};

export function Threads() {
  const [_searchParams] = useSearchParams();

  return (
    <Grid>
      <ThreadList />
      <Grid.Col sm="12" lg="6" xl="9">
        <InfoList />
      </Grid.Col>
    </Grid>
  );
}
