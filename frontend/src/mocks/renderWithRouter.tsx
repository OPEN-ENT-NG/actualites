import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render } from './setup';

type RenderWithRouterOptions = {
  routePath?: string;
};

export const renderWithRouter = (
  path = '/',
  element: JSX.Element,
  options?: RenderWithRouterOptions,
) => {
  // Extract pathname and search params separately
  const url = new URL(path, 'http://localhost');
  const pathname = url.pathname;
  const search = url.search;

  const routes = [
    {
      path: options?.routePath ?? pathname,
      element,
    },
  ];

  const router = createMemoryRouter(routes, {
    initialEntries: [{ pathname, search }],
  });

  return {
    /**
     * We use our customRender fn to wrap Router with our Providers
     */
    ...render(<RouterProvider router={router} />),
  };
};
