import { QueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

export const loader = (queryClient: QueryClient) => async () => {
  return null;
};

export function Threads() {
  const { threadId } = useParams();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  return (
    <div>
      Threads {threadId && <span>with thread ID {threadId}</span>}
      {tab && <span> and tab {tab}</span>}
    </div>
  );
}
