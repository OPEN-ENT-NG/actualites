import { Flex } from '@edifice.io/react';
import { QueryClient } from '@tanstack/react-query';
import { CreateInfoForm } from '~/features/createInfo/CreateInfoForm';
import { CreateInfoHeader } from '~/features/createInfo/CreateInfoHeader';
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
        className="create-info-container overflow-hidden"
      >
        <CreateInfoHeader />
        <CreateInfoForm />
      </Flex>
    </Flex>
  );
}
