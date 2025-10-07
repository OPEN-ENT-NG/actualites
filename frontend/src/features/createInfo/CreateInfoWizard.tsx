import { QueryClient } from '@tanstack/react-query';
import { CreateInfoForm } from '~/features/createInfo/CreateInfoForm';
import { CreateInfoFormSkeleton } from '~/features/createInfo/CreateInfoFormSkeleton';
import { CreateInfoHeader } from '~/features/createInfo/CreateInfoHeader';
import { CreateInfoHeaderSkeleton } from '~/features/createInfo/CreateInfoHeaderSkeleton';
import { useThreads } from '~/services/queries';
import { CreationStep, useCreationStore } from '~/store/creationStore';

export const loader = (_queryClient: QueryClient) => async () => {
  return null;
};

export function CreateInfoWizard() {
  const { currentCreationStep } = useCreationStore();
  const { data: threads } = useThreads();
  if (currentCreationStep === CreationStep.INFO_PARAM) {
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
  } else {
    // TODO step 2
    return (
      <>
        {threads ? (
          <>
            <CreateInfoHeader />
            <>Future step 2 components</>
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
}
