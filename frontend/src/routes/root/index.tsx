import {
  AppHeader,
  Breadcrumb,
  Flex,
  Layout,
  LoadingScreen,
  useEdificeClient,
} from '@edifice.io/react';

import { Outlet, useLoaderData, useLocation } from 'react-router-dom';

import { IWebApp } from '@edifice.io/client';
import { existingActions } from '~/config';
import { AdminNewThreadButton } from '~/features';
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

  const { currentApp, init } = useEdificeClient();
  const location = useLocation();
  const { canContributeOnOneThread } = useThreadsUserRights();
  const { canCreateThread } = useUserRights();

  if (!init) return <LoadingScreen position={false} />;

  const displayApp = {
    displayName: 'news',
    icon: 'actualites-large',
  };
  const pathname = location.pathname;
  const isAdminThreadPath = pathname.includes('/admin/threads');
  const isCreateRoute = pathname.includes('/create/info');

  return init ? (
    <Layout>
      <AppHeader>
        <Breadcrumb app={(currentApp as IWebApp) ?? displayApp} />
        {!isCreateRoute && (
          <Flex fill align="center" justify="end">
            {isAdminThreadPath ? (
              <>{canCreateThread && <AdminNewThreadButton />}</>
            ) : (
              canContributeOnOneThread && <NewInfoButton />
            )}
          </Flex>
        )}
      </AppHeader>
      <Outlet />
    </Layout>
  ) : null;
};

export default Root;
