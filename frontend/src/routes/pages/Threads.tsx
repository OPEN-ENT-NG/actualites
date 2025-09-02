import { QueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import { InfoList } from '~/components';

export const loader = (queryClient: QueryClient) => async () => {
  return null;
};

export function Threads() {
  const { threadId } = useParams();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');

  return <InfoList />;
}
