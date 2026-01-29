import {
  AppHeader,
  Breadcrumb,
  Flex,
  Layout,
  LoadingScreen,
  useBreakpoint,
  useEdificeClient,
} from '@edifice.io/react';

import { Outlet, useLoaderData } from 'react-router-dom';

import { IWebApp } from '@edifice.io/client';
import clsx from 'clsx';
import { existingActions } from '~/config';
import { AdminNewThreadButton } from '~/features';
import { useThreadRoute } from '~/hooks/useThreadRoute';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { useUserRights } from '~/hooks/useUserRights';
import { queryClient } from '~/providers';
import { actionsQueryOptions } from '~/services/queries/actions';
import { useActionUserRights } from '~/store';
import { NewInfoButton } from './components/NewInfoButton';

/** Check old format URL and redirect if needed */
export const loader = async () => {
  const actionUserRights = await queryClient.ensureQueryData(
    actionsQueryOptions(existingActions),
  );
  return { actionUserRights };
};

export const Root = () => {
  const { actionUserRights } = useLoaderData() as {
    actionUserRights: Record<string, boolean>;
  };
  const setRights = useActionUserRights.use.setRights();
  setRights(actionUserRights);
  const { type: routeType } = useThreadRoute();

  const { currentApp, init } = useEdificeClient();
  const { canContributeOnOneThread } = useThreadsUserRights(
    routeType === 'admin',
  );
  const { canCreateThread } = useUserRights();
  const { lg } = useBreakpoint();

  if (!init) return <LoadingScreen position={false} />;

  const displayApp = {
    displayName: 'news',
    icon: 'actualites-large',
  };

  return init ? (
    <div
      className={clsx({
        'd-flex flex-column vh-100': lg && routeType === 'list',
      })}
    >
      <Layout>
        <AppHeader>
          <Breadcrumb app={(currentApp as IWebApp) ?? displayApp} />
          {routeType !== 'create' && (
            <Flex fill align="center" justify="end">
              {routeType === 'admin'
                ? canCreateThread && <AdminNewThreadButton />
                : routeType !== 'param' &&
                  canContributeOnOneThread && <NewInfoButton />}
            </Flex>
          )}
        </AppHeader>
        <Outlet />
      </Layout>
    </div>
  ) : null;
};

export default Root;
