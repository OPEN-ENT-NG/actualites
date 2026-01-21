import { Grid, useBreakpoint } from '@edifice.io/react';
import { ThreadListDesktop, ThreadListMobile } from './components';
import clsx from 'clsx';

export function ThreadList() {
  const { lg } = useBreakpoint();

  return (
    <Grid.Col
      sm="12"
      lg="2"
      xl="3"
      className={clsx({ 'border-end overflow-x-hidden': lg })}
    >
      {lg ? <ThreadListDesktop /> : <ThreadListMobile />}
    </Grid.Col>
  );
}
