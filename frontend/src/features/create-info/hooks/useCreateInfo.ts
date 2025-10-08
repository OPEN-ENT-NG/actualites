import { useCreateDraftInfo } from '~/services/queries';
import { CreationStep, useCreationStore } from '~/store/creationStore';

export function useCreateInfo() {
  const { infoForm, resetForm, setCurrentCreationStep } = useCreationStore();
  const { mutate: createDraftInfo } = useCreateDraftInfo(); // Assume this hook exists

  const onSaveDraft = () => {
    if (!infoForm) return;

    const infoFormValues = infoForm.values;

    createDraftInfo(
      {
        title: infoFormValues.title,
        content: infoFormValues.content,
        thread_id: infoFormValues.thread_id,
      },
      {
        onSuccess: () => {
          console.log('Draft created');
        },
      },
    );

    resetForm?.();
  };

  const onNextStep = () => {
    if (infoForm?.isValid) {
      setCurrentCreationStep(CreationStep.INFO_SHARE);
    }
  };

  return {
    infoForm,
    onSaveDraft,
    onNextStep,
  };
}
