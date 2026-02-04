import { ScreebProvider } from '@screeb/sdk-react';
import { ReactNode } from 'react';

const SCREEB_APP_ID = '55edb49f-f5ac-4519-8d20-71e16929d626';

export const EdificeScreebProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <ScreebProvider autoInit websiteId={SCREEB_APP_ID}>
      {children}
    </ScreebProvider>
  );
};
