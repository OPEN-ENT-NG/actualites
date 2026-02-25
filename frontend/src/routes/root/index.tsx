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
import { useRouteType } from '~/hooks/useRouteType';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { useUserRights } from '~/hooks/useUserRights';
import { ThreadListFilter } from '~/models/thread';
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
  const { isAdminRoute, isCreateRoute, isListRoute, isParamRoute } =
    useRouteType();

  const { currentApp, init } = useEdificeClient();
  const { canContributeOnOneThread } = useThreadsUserRights(
    isAdminRoute ? ThreadListFilter.MANAGABLE : undefined,
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
        'd-flex flex-column vh-100': lg && isListRoute,
      })}
    >
      <Layout>
        <AppHeader>
          <Breadcrumb app={(currentApp as IWebApp) ?? displayApp} />
          {!isCreateRoute && (
            <Flex fill align="center" justify="end">
              {isAdminRoute
                ? canCreateThread && <AdminNewThreadButton />
                : !isParamRoute &&
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
