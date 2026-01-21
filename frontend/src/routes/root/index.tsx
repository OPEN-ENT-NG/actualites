import {
  AppHeader,
  Breadcrumb,
  Flex,
  Layout,
  LoadingScreen,
  useBreakpoint,
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
  const { pathname } = useLocation();
  const isAdminThreadPath = pathname.includes('/threads/admin');
  const isCreateRoute = pathname.includes('/infos/create');
  const isThreadsListPage =
    pathname === '/' || pathname.startsWith('/threads/');

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
    <div
      className={clsx({ 'd-flex flex-column vh-100': lg && isThreadsListPage })}
    >
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
