import { QueryClient } from '@tanstack/react-query';

export const loader = (queryClient: QueryClient) => async () => {
  return null;
};

export function Create() {
  return <div>Create Thread</div>;
}
