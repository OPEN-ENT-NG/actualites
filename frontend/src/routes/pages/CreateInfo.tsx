import { Flex } from '@edifice.io/react';
import { QueryClient } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';
import { CreateInfoFormActions } from '~/features/create-info/components/CreateInfoFormActions';
import './CreateInfo.css';

export const loader = (_queryClient: QueryClient) => async () => {
  return null;
};

export function CreateInfo() {
  return (
    <Flex fill className="py-16" justify="center">
      <Flex
        direction="column"
        fill
        wrap="nowrap"
        gap="24"
        className="create-info-container overflow-hidden"
      >
        <Outlet />
        <CreateInfoFormActions />
      </Flex>
    </Flex>
  );
}
