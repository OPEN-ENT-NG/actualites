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
  replace,
  useLoaderData,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { IWebApp } from '@edifice.io/client';
import { IconPlus } from '@edifice.io/react/icons';
import { existingActions } from '~/config';
import { AdminNewThreadButton } from '~/features';
import { useI18n } from '~/hooks/useI18n';
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
    let shouldReinterpretRoute = false;
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
          redirectPath = `/threads/${isPathWithInfo.params.threadId}#info-${isPathWithInfo.params.infoId}`;
          shouldReinterpretRoute = true; // Replace in history AND let the router reinterpret query params
        } else if (isPathWithThread) {
          // Redirect to the new format
          redirectPath = `/threads/${isPathWithThread.params.id}`;
          shouldReinterpretRoute = true; // Replace in history AND let the router reinterpret query params
        }
      }
    }

    if (redirectPath) {
      const newUrl =
        window.location.origin + basename.replace(/\/$/g, '') + redirectPath;
      window.history.replaceState(null, '', newUrl);
      if (shouldReinterpretRoute) return replace(newUrl);
    }
  }

  return { actionUserRights };
};

export const Root = () => {
  const { t } = useI18n();
  const { actionUserRights } = useLoaderData() as {
    actionUserRights: Record<string, boolean>;
  };
  const setRights = useActionUserRights.use.setRights();
  setRights(actionUserRights);

  const { currentApp, init } = useEdificeClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { canContributeOnOneThread } = useThreadsUserRights();
  const displayApp = {
    displayName: 'news',
    icon: 'actualites-large',
  };
  const isAdminThreadPath = window.location.pathname.includes('/admin/threads');

  const pathname = location.pathname;
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
            {isAdminThreadPath ? (
              <AdminNewThreadButton />
            ) : (
              canContributeOnOneThread && (
                <Button onClick={handleClickNewInfo} leftIcon={<IconPlus />}>
                  {t('actualites.info.create')}
                </Button>
              )
            )}
          </Flex>
        )}
      </AppHeader>
      <Outlet />
    </Layout>
  ) : null;
};

export default Root;
