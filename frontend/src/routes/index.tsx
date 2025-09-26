import { QueryClient } from '@tanstack/react-query';
import { RouteObject, createBrowserRouter } from 'react-router-dom';

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
                  {
                    path: 'infos/:infoIdAsString/edit',
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
      {
        path: 'drafts/create',
        async lazy() {
          const { loader, Create: Component } =
            await import('~/routes/pages/Create');
          return {
            loader: loader(queryClient),
            Component,
          };
        },
      },
    ],
  },
  /* Display an info using previous format. */
  {
    path: 'oldformat/:threadIdAsString/:infoIdAsString',
    async lazy() {
      const { Component } = await import('./old-format');
      return {
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

export const router = (queryClient: QueryClient) =>
  createBrowserRouter(routes(queryClient), {
    basename,
  });
