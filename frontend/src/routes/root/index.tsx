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
import { useState } from 'react';
import { InfoModal } from '~/components/InfoModal/InfoModal';
import { PortalModal } from '~/components/PortalModal';
import { existingActions } from '~/config';
import { AdminNewThreadButton } from '~/features';
import { useI18n } from '~/hooks/useI18n';
import { useScrollToElement } from '~/hooks/useScrollToElement';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { InfoId } from '~/models/info';
import { queryClient } from '~/providers';
import { infoQueryOptions } from '~/services/queries';
import { actionsQueryOptions } from '~/services/queries/actions';
import { useActionUserRights } from '~/store';
import { basename } from '..';

/** Check old format URL and redirect if needed */
export const loader = async () => {
  const actionUserRights = await queryClient.ensureQueryData(
    actionsQueryOptions(existingActions),
  );
  const hashLocation = location.hash.substring(1);
  // Check if the URL is an old format (angular route with hash) and redirect to the new format
  let redirectPath, unavailableInfoId;
  if (hashLocation) {
    let shouldReinterpretRoute = false;
    const hasDefaultFilter = matchPath('/default?filter=:filter', hashLocation);

    if (hasDefaultFilter) {
      redirectPath = `/threads/${hasDefaultFilter.params.filter}`;
    } else {
      const isDefault = matchPath('/default', hashLocation);

      if (isDefault) {
        // Suppress unused hash but do not reload the page
        redirectPath = `/threads`;
      } else {
        // Manage some retro-compatible URLs in old format (angular route with hash)
        const isPathWithComment = matchPath(
          '/view/info/:infoId/comment/:commentId',
          hashLocation,
        );
        const isPathWithInfo = matchPath(
          '/view/thread/:threadId/info/:infoId',
          hashLocation,
        );
        const isPathWithThread = matchPath('/view/thread/:id', hashLocation);

        if (isPathWithComment || isPathWithInfo || isPathWithThread) {
          shouldReinterpretRoute = true; // Replace in history AND let the router reinterpret query params
          if (isPathWithComment) {
            // Redirect to the new format
            const { infoId, commentId } = isPathWithComment.params;
            // The threadId is not known, so load the info details at first.
            try {
              const details = await queryClient.ensureQueryData(
                infoQueryOptions.getInfoById(Number(infoId)),
              );
              redirectPath = `/threads/${details.thread.id}/infos/${infoId}#comment-${commentId}`;
            } catch (e) {
              // Info is no more available.
              redirectPath = `/threads`;
              unavailableInfoId = Number(infoId);
              shouldReinterpretRoute = false;
            }
          } else if (isPathWithInfo) {
            // Redirect to the new format
            redirectPath = `/threads/${isPathWithInfo.params.threadId}#info-${isPathWithInfo.params.infoId}`;
          } else if (isPathWithThread) {
            // Redirect to the new format
            redirectPath = `/threads/${isPathWithThread.params.id}`;
          }
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

  return { actionUserRights, unavailableInfoId };
};

export const Root = () => {
  const { t, common_t } = useI18n();
  const { actionUserRights, unavailableInfoId } = useLoaderData() as {
    actionUserRights: Record<string, boolean>;
    unavailableInfoId?: InfoId;
  };
  const setRights = useActionUserRights.use.setRights();
  setRights(actionUserRights);

  const { currentApp, init } = useEdificeClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { canContributeOnOneThread } = useThreadsUserRights();
  const isRssUnavailable = typeof unavailableInfoId === 'number';
  const [isRssModalOpen, setRssModalOpen] = useState(isRssUnavailable);

  // Check URL for any hash (HTML element ID) to scroll into view
  let { hash, infoId, deferScrollIntoView } = useScrollToElement();

  if (!init) return <LoadingScreen position={false} />;

  if (hash) {
    deferScrollIntoView(hash);
  }

  const displayApp = {
    displayName: 'news',
    icon: 'actualites-large',
  };
  const pathname = location.pathname;
  const isAdminThreadPath = pathname.includes('/admin/threads');
  const isCreateRoute = pathname.includes('/create/info');

  const handleClickNewInfo = () => {
    navigate('/create/info');
  };

  const handleModalClose = () => {
    setRssModalOpen(false);
  };

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

      {infoId && <InfoModal infoId={infoId} />}

      {isRssUnavailable && (
        <PortalModal
          id="modal-rss-unavailable"
          onModalClose={handleModalClose}
          isOpen={isRssModalOpen}
          header={t('actualites.info.unavailable.title')}
          footer={
            <Button onClick={handleModalClose}>{common_t('close')}</Button>
          }
        >
          {t('actualites.info.unavailable.body')}
        </PortalModal>
      )}
    </Layout>
  ) : null;
};

export default Root;
