import { QueryClient } from '@tanstack/react-query';
import { CreateInfoForm } from '~/features/create-info/components/CreateInfoForm';
import { CreateInfoFormHeader } from '~/features/create-info/components/CreateInfoFormHeader';
import { CreateInfoFormHeaderSkeleton } from '~/features/create-info/components/CreateInfoFormHeaderSkeleton';
import { CreateInfoFormSkeleton } from '~/features/create-info/components/CreateInfoFormSkeleton';
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
          <CreateInfoFormHeader />
          <CreateInfoForm />
        </>
      ) : (
        <>
          <CreateInfoFormHeaderSkeleton />
          <CreateInfoFormSkeleton />
        </>
      )}
    </>
  );
}
