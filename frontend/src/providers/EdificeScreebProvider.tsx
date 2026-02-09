import { useEdificeClient } from '@edifice.io/react';
import { ScreebProvider, useScreeb } from '@screeb/sdk-react';
import { ReactNode, useEffect } from 'react';
import { useScreebIdentity } from '~/hooks/useScreebIdentity';
import { useConfig } from '~/services/queries/config';

const ScreebInitializer = () => {
  const { data: config } = useConfig();
  const { user } = useEdificeClient();
  const screeb = useScreeb();
  useScreebIdentity(user);

  useEffect(() => {
    if (config?.screebAppID) {
      screeb.init(config?.screebAppID);
    }
  }, [config?.screebAppID]);

  return null;
};

export const EdificeScreebProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <ScreebProvider>
      <ScreebInitializer />
      {children}
    </ScreebProvider>
  );
};
