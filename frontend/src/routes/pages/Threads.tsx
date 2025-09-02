import { QueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

export const loader = (queryClient: QueryClient) => async () => {
  return null;
};

export function Threads() {
  const { threadId, info } = useParams();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');

  return (
    <div>
      Threads {threadId && <span>with thread ID {threadId}</span>}
      {info && <span> and info {info}</span>}
      {status && <span> and status {status}</span>}
    </div>
  );
}
