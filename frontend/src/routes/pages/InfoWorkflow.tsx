import { Flex } from '@edifice.io/react';
import { QueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs, Outlet } from 'react-router-dom';
import './InfoWorkflow.css';
import { infoQueryOptions } from '~/services/queries';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    if (params.infoId) {
      const queryInfo = infoQueryOptions.getInfoById(Number(params.infoId));
      queryClient.ensureQueryData(queryInfo);
    }
    return null;
  };

export function InfoWorkflow() {
  return (
    <Flex fill className="py-16" justify="center">
      <Flex
        direction="column"
        fill
        wrap="nowrap"
        gap="24"
        className="info-workflow-container overflow-hidden"
      >
        <Outlet />
      </Flex>
    </Flex>
  );
}
