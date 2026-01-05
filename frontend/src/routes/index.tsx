import { QueryClient } from '@tanstack/react-query';
import { RouteObject, createBrowserRouter } from 'react-router-dom';
import { manageRedirections } from '~/routes/redirections';

import { NotFound } from './errors/not-found';
import { PageError } from './errors/page-error';

const routes = (queryClient: QueryClient): RouteObject[] => [
  /* Main route */
  {
    path: '/',
    async lazy() {
      const { loader, Root: Component } = await import('~/routes/root');
      return {
        loader,
        Component,
      };
    },
    errorElement: <PageError />,
    children: [
      {
        path: 'create/info',
        async lazy() {
          const { loader, CreateInfo: Component } =
            await import('~/routes/pages/CreateInfo');
          return {
            loader: loader(queryClient),
            Component,
          };
        },
        children: [
          {
            path: '',
            index: true,
            async lazy() {
              const { loader, CreateInfoDetails: Component } =
                await import('~/routes/pages/CreateInfoDetails');
              return {
                loader: loader(queryClient),
                Component,
              };
            },
          },
          {
            path: ':infoIdAsString/rights',
            async lazy() {
              const { loader, CreateInfoRights: Component } =
                await import('~/routes/pages/CreateInfoRights');
              return {
                loader: loader(queryClient),
                Component,
              };
            },
          },
          {
            path: ':infoIdAsString',
            async lazy() {
              const { loader, CreateInfoDetails: Component } =
                await import('~/routes/pages/CreateInfoDetails');
              return {
                loader: loader(queryClient),
                Component,
              };
            },
          },
        ],
      },
      {
        id: 'EditInfo',
        path: 'threads/:threadIdAsString/infos/:infoIdAsString/edit',
        async lazy() {
          const { loader, EditInfo: Component } =
            await import('~/routes/pages/EditInfo');
          return {
            loader: loader(queryClient),
            Component,
          };
        },
      },
      {
        path: 'admin/threads',
        async lazy() {
          const { loader, AdminThreads: Component } =
            await import('~/routes/pages/AdminThreads');
          return {
            loader: loader(queryClient),
            Component,
          };
        },
      },
      {
        path: 'infos/:infoIdAsString',
        async lazy() {
          const { loader, Infos: Component } =
            await import('~/routes/pages/Infos');
          return {
            loader: loader(queryClient),
            Component,
          };
        },
      },
      {
        path: '',
        async lazy() {
          const { loader, Threads: Component } =
            await import('~/routes/pages/Threads');
          return {
            loader: loader(queryClient),
            Component,
          };
        },
        children: [
          {
            path: 'threads',
            children: [
              {
                path: ':threadIdAsString',
                children: [
                  {
                    path: '',
                    index: true,
                    async lazy() {
                      const { loader, Threads: Component } =
                        await import('~/routes/pages/Threads');
                      return {
                        loader: loader(queryClient),
                        Component,
                      };
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  /* Display an info using previous format. */
  {
    path: 'oldformat/:threadIdAsString/:infoIdAsString',
    async lazy() {
      const { loader, Component } = await import('./old-format');
      return {
        loader,
        Component,
      };
    },
  },
  /* 404 Page */
  {
    path: '*',
    element: <NotFound />,
  },
];

export const basename = import.meta.env.PROD ? '/actualites' : '/';

export const router = (queryClient: QueryClient) => {
  const redirectPath = manageRedirections();

  if (redirectPath) {
    const newUrl =
      window.location.origin + basename.replace(/\/$/g, '') + redirectPath;
    window.history.replaceState(null, '', newUrl);
  }
  return createBrowserRouter(routes(queryClient), {
    basename,
  });
};
