import {
  AppHeader,
  Breadcrumb,
  Button,
  Flex,
  Layout,
  LoadingScreen,
  useEdificeClient,
} from '@edifice.io/react';

import {
  matchPath,
  Outlet,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';

import { IWebApp } from '@edifice.io/client';
import { existingActions } from '~/config';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { queryClient } from '~/providers';
import { actionsQueryOptions } from '~/services/queries/actions';
import { useActionUserRights } from '~/store';
import { basename } from '..';

/** Check old format URL and redirect if needed */
export const loader = async () => {
  const actionUserRights = await queryClient.ensureQueryData(
    actionsQueryOptions(existingActions),
  );

  const hashLocation = location.hash.substring(1);
  // Check if the URL is an old format (angular root with hash) and redirect to the new format
  let redirectPath;
  if (hashLocation) {
    const hasDefaultFilter = matchPath('/default?filter=:filter', hashLocation);

    if (hasDefaultFilter) {
      redirectPath = `/threads/${hasDefaultFilter?.params.filter}`;
    } else {
      const isDefault = matchPath('/default', hashLocation);

      if (isDefault) {
        // Suppress unused hash but do not reload the page
        redirectPath = `/threads`;
      } else {
        const isPathWithInfo = matchPath(
          '/view/thread/:threadId/info/:infoId',
          hashLocation,
        );
        const isPathWithThread = matchPath('/view/thread/:id', hashLocation);

        if (isPathWithInfo) {
          // Redirect to the new format
          redirectPath = `/${isPathWithInfo?.params.threadId}/infos/${isPathWithInfo?.params.infoId}`;
        } else if (isPathWithThread) {
          // Redirect to the new format
          redirectPath = `/${isPathWithThread?.params.id}`;
        }
      }
    }

    if (redirectPath) {
      const newUrl =
        window.location.origin + basename.replace(/\/$/g, '') + redirectPath;
      window.history.replaceState(null, '', newUrl);
    }
  }

  return { actionUserRights };
};

export const Root = () => {
  const { actionUserRights } = useLoaderData() as {
    actionUserRights: Record<string, boolean>;
  };
  const setRights = useActionUserRights.use.setRights();
  setRights(actionUserRights);

  const { currentApp, init } = useEdificeClient();
  const navigate = useNavigate();
  const { canContributeOnOneThread } = useThreadsUserRights();
  const displayApp = {
    displayName: 'news',
    icon: 'actualites-large',
  };

  const pathname = window.location.pathname;
  const isCreateRoute = pathname.includes('/create/info');

  const handleClickNewInfo = () => {
    navigate('/create/info');
  };

  if (!init) return <LoadingScreen position={false} />;
  return init ? (
    <Layout>
      <AppHeader>
        <Breadcrumb app={(currentApp as IWebApp) ?? displayApp} />
        {!isCreateRoute && canContributeOnOneThread && (
          <Flex fill align="center" justify="end">
            {canContributeOnOneThread && (
              <Button onClick={handleClickNewInfo}>New Article</Button>
            )}
          </Flex>
        )}
      </AppHeader>
      <Outlet />
    </Layout>
  ) : null;
};

export default Root;
