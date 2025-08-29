import { Layout, LoadingScreen, useEdificeClient } from '@edifice.io/react';

import { matchPath, Outlet } from 'react-router-dom';

import { basename } from '..';

/** Check old format URL and redirect if needed */
export const loader = async () => {
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
      location.replace(
        location.origin + basename.replace(/\/$/g, '') + redirectPath,
      );
    }
  }

  return null;
};

export const Root = () => {
  const { init } = useEdificeClient();

  if (!init) return <LoadingScreen position={false} />;

  return init ? (
    <Layout>
      actualites
      <Outlet />
    </Layout>
  ) : null;
};

export default Root;
