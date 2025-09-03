import { Flex, useBreakpoint } from '@edifice.io/react';
import { ReactNode } from 'react';
import './SeparatedInfo.css';

export function SeparatedInfo({
  stackingBreakpoint = 'md',
  children,
}: {
  stackingBreakpoint?: keyof ReturnType<typeof useBreakpoint>;
  children: ReactNode[];
}) {
  const breakpoints = useBreakpoint();
  const direction = breakpoints[stackingBreakpoint] ? 'row' : 'column';

  return (
    <Flex direction={direction} className="separated-info">
      {...children}
    </Flex>
  );
}
