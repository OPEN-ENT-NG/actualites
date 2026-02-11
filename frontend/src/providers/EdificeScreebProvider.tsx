import { useEdificeClient } from '@edifice.io/react';
import { ScreebProvider, useScreeb } from '@screeb/sdk-react';
import { ReactNode, useEffect } from 'react';
import { useScreebIdentity } from '~/hooks/useScreebIdentity';
import { useConfig } from '~/services/queries/config';

const ScreebInitializer = () => {
  const { data: config } = useConfig();
  const { init } = useScreeb();
  const { user } = useEdificeClient();
  const { setIdentity } = useScreebIdentity();

  useEffect(() => {
    if (user && config?.['screeb-app-id']) {
      init(config?.['screeb-app-id']).then(() => {
        setIdentity(user);
      });
    }
  }, [config?.['screeb-app-id'], setIdentity, init]);
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
