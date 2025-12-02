import { Grid, useBreakpoint } from '@edifice.io/react';
import { ThreadListDesktop, ThreadListMobile } from './components';

export function ThreadList() {
  const { lg } = useBreakpoint();

  return (
    <Grid.Col sm="12" lg="2" xl="3" className={lg ? 'border-end' : ''}>
      {lg ? <ThreadListDesktop /> : <ThreadListMobile />}
    </Grid.Col>
  );
}
