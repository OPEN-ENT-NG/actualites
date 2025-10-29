import { useBreakpoint } from '@edifice.io/react';
import { ThreadListDesktop, ThreadListMobile } from './components';

export function ThreadList() {
  const { md } = useBreakpoint();

  return <>{md ? <ThreadListDesktop /> : <ThreadListMobile />}</>;
}
