import { useBreakpoint } from '@edifice.io/react';
import { ThreadListDesktop, ThreadListMobile } from './components';

export function ThreadList() {
  const { lg } = useBreakpoint();

  return <>{lg ? <ThreadListDesktop /> : <ThreadListMobile />}</>;
}
