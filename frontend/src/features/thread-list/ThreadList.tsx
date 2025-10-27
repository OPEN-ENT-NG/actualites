import { useBreakpoint } from '@edifice.io/react';
import { DesktopMenu } from '~/components';
import { MobileMenu } from './components/MobileMenu';

export function ThreadList() {
  const { md } = useBreakpoint();

  return <>{md ? <DesktopMenu /> : <MobileMenu />}</>;
}
