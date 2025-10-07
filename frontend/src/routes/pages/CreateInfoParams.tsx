import { QueryClient } from '@tanstack/react-query';
import { CreateInfoForm } from '~/features/createInfo/CreateInfoForm';
import { CreateInfoFormSkeleton } from '~/features/createInfo/CreateInfoFormSkeleton';
import { CreateInfoHeader } from '~/features/createInfo/CreateInfoHeader';
import { CreateInfoHeaderSkeleton } from '~/features/createInfo/CreateInfoHeaderSkeleton';
import { useThreads } from '~/services/queries';

export const loader = (_queryClient: QueryClient) => async () => {
  return null;
};

export function CreateInfoParams() {
  const { data: threads } = useThreads();
  return (
    <>
      {threads ? (
        <>
          <CreateInfoHeader />
          <CreateInfoForm />
        </>
      ) : (
        <>
          <CreateInfoHeaderSkeleton />
          <CreateInfoFormSkeleton />
        </>
      )}
    </>
  );
}
