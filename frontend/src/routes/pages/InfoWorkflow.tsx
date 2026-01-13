import { Flex } from '@edifice.io/react';
import { QueryClient } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';
import './InfoWorkflow.css';

export const loader = (_queryClient: QueryClient) => async () => {
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
