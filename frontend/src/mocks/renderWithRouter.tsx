import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render } from './setup';

export const renderWithRouter = (path = '/', element: JSX.Element) => {
  // Extract pathname and search params separately
  const url = new URL(path, 'http://localhost');
  const pathname = url.pathname;
  const search = url.search;

  const routes = [
    {
      path: pathname,
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
