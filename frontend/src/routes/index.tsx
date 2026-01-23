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
        id: 'AdminThreads',
        path: 'threads/admin',
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
        id: 'CreateInfo',
        path: 'infos/create',
        async lazy() {
          const { loader, InfoWorkflow: Component } =
            await import('~/routes/pages/InfoWorkflow');
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
              const { InfoWorkflowDetails: Component } =
                await import('~/routes/pages/InfoWorkflowDetails');
              return { Component };
            },
          },
        ],
      },
      {
        path: 'infos/:infoIdAsString',
        children: [
          {
            path: 'create',
            id: 'CreateInfoFlow',
            async lazy() {
              const { loader, InfoWorkflow: Component } =
                await import('~/routes/pages/InfoWorkflow');
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
                  const { InfoWorkflowDetails: Component } =
                    await import('~/routes/pages/InfoWorkflowDetails');
                  return { Component };
                },
              },
              {
                path: 'rights',
                async lazy() {
                  const { loader, InfoWorkflowRights: Component } =
                    await import('~/routes/pages/InfoWorkflowRights');
                  return {
                    loader: loader(queryClient),
                    Component,
                  };
                },
              },
            ],
          },
          {
            path: 'edit',
            async lazy() {
              const { loader, InfoWorkflow: Component } =
                await import('~/routes/pages/InfoWorkflow');
              return {
                loader: loader(queryClient),
                Component,
              };
            },
            children: [
              {
                id: 'EditInfo',
                path: '',
                index: true,
                async lazy() {
                  const { InfoWorkflowDetails: Component } =
                    await import('~/routes/pages/InfoWorkflowDetails');
                  return { Component };
                },
              },
            ],
          },
          {
            path: 'publish',
            async lazy() {
              const { loader, InfoWorkflow: Component } =
                await import('~/routes/pages/InfoWorkflow');
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
                  const { InfoWorkflowDetails: Component } =
                    await import('~/routes/pages/InfoWorkflowDetails');
                  return { Component };
                },
              },
              {
                path: 'rights',
                async lazy() {
                  const { loader, InfoWorkflowRights: Component } =
                    await import('~/routes/pages/InfoWorkflowRights');
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
      {
        path: 'threads/admin',
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
        path: '',
        id: 'Threads',
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
  {
    path: '/infos/:infoIdAsString/print',
    index: true,
    async lazy() {
      const { loader, InfoPrint: Component } =
        await import('~/routes/pages/InfoPrint.tsx');
      return {
        loader: loader(queryClient),
        Component,
      };
    },
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
