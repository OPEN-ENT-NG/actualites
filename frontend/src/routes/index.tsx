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
        path: 'threads',
        children: [
          {
            path: '',
            index: true,
            async lazy() {
              const { loader, Threads: Component } = await import(
                '~/routes/pages/Threads'
              );
              return {
                loader: loader(queryClient),
                Component,
              };
            },
          },
          {
            path: ':threadId',
            children: [
              {
                path: '',
                index: true,
                async lazy() {
                  const { loader, Threads: Component } = await import(
                    '~/routes/pages/Threads'
                  );
                  return {
                    loader: loader(queryClient),
                    Component,
                  };
                },
              },
              {
                path: 'infos/:info/edit',
                async lazy() {
                  const { loader, Threads: Component } = await import(
                    '~/routes/pages/Threads'
                  );
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
        path: 'drafts/create',
        async lazy() {
          const { loader, Create: Component } = await import(
            '~/routes/pages/Create'
          );
          return {
            loader: loader(queryClient),
            Component,
          };
        },
      },
    ],
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
