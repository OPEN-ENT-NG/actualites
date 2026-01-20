import {
  AppHeader,
  Breadcrumb,
  Flex,
  Layout,
  LoadingScreen,
  useBreakpoint,
  useEdificeClient,
} from '@edifice.io/react';

import { Outlet, useLoaderData, useMatches } from 'react-router-dom';

import { IWebApp } from '@edifice.io/client';
import { existingActions } from '~/config';
import { AdminNewThreadButton } from '~/features';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { useUserRights } from '~/hooks/useUserRights';
import { queryClient } from '~/providers';
import { actionsQueryOptions } from '~/services/queries/actions';
import { useActionUserRights } from '~/store';
import { NewInfoButton } from './components/NewInfoButton';
import clsx from 'clsx';

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
  const matches = useMatches();
  const isAdminThreadPath = matches.find(
    (route) => route.id === 'AdminThreads',
  );
  const isCreateRoute = matches.find((route) => route.id === 'CreateInfo');

  const { currentApp, init } = useEdificeClient();
  const { canContributeOnOneThread } =
    useThreadsUserRights(!!isAdminThreadPath);
  const { canCreateThread } = useUserRights();
  const { lg } = useBreakpoint();

  if (!init) return <LoadingScreen position={false} />;

  const displayApp = {
    displayName: 'news',
    icon: 'actualites-large',
  };

  return init ? (
    <div className={clsx({ 'd-flex flex-column vh-100': lg })}>
      <Layout>
        <AppHeader>
          <Breadcrumb app={(currentApp as IWebApp) ?? displayApp} />
          {!isCreateRoute && (
            <Flex fill align="center" justify="end">
              {isAdminThreadPath
                ? canCreateThread && <AdminNewThreadButton />
                : canContributeOnOneThread && <NewInfoButton />}
            </Flex>
          )}
        </AppHeader>
        <Outlet />
      </Layout>
    </div>
  ) : null;
};

export default Root;
