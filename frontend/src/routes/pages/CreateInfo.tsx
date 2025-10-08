import { Flex } from '@edifice.io/react';
import { QueryClient } from '@tanstack/react-query';
import { CreateInfoForm } from '~/features/create-info/CreateInfoForm';
import { CreateInfoHeader } from '~/features/create-info/CreateInfoHeader';
import { CreateInfoSkeleton } from '~/features/create-info/CreateInfoSkeleton';
import { useThreads } from '~/services/queries';
import './CreateInfo.css';

export const loader = (_queryClient: QueryClient) => async () => {
  return null;
};

export function CreateInfo() {
  const { data: threads } = useThreads();
  return (
    <Flex fill className="py-16" justify="center">
      <Flex
        direction="column"
        fill
        wrap="nowrap"
        className="create-info-container overflow-hidden"
      >
        {threads ? (
          <>
            <CreateInfoHeader />
            <CreateInfoForm />
          </>
        ) : (
          <CreateInfoSkeleton />
        )}
      </Flex>
    </Flex>
  );
}
