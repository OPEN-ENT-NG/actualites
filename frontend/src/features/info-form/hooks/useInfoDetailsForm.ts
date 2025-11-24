import { useNavigate } from 'react-router-dom';
import { InfoId, InfoStatus } from '~/models/info';
import { useCreateDraftInfo, useUpdateInfo } from '~/services/queries';
import { InfoDetailsFormParams, useInfoFormStore } from '~/store/infoFormStore';

export function useInfoDetailsForm() {
  const detailsForm = useInfoFormStore.use.infoDetailsForm();
  const detailsFormState = useInfoFormStore.use.infoDetailsFormState();
  const setDetailsForm = useInfoFormStore.use.setInfoDetailsForm();
  const resetDetailsForm = useInfoFormStore.use.resetInfoDetailsForm();
  const setResetDetailsForm = useInfoFormStore.use.setResetInfoDetailsForm();
  const setDetailsFormState = useInfoFormStore.use.setInfoDetailsFormState();
  const navigate = useNavigate();
  const { mutate: createDraftInfo } = useCreateDraftInfo();
  const { mutate: updateDraftInfo } = useUpdateInfo();

  const createOrUpdateInfo = (
    infoFormValues: InfoDetailsFormParams,
    onSuccess?: ({ id }: { id: InfoId }) => void,
  ) => {
    if (infoFormValues.infoId) {
      if (infoFormValues.thread_id && infoFormValues.infoStatus) {
        return updateDraftInfo(
          {
            infoId: infoFormValues.infoId,
            infoStatus: infoFormValues.infoStatus,
            payload: {
              thread_id: Number(infoFormValues.thread_id),
              content: infoFormValues.content,
              title: infoFormValues.title,
              is_headline: infoFormValues.headline,
            },
          },
          {
            onSuccess: ({ id }: { id: InfoId }) => {
              resetDetailsForm?.();
              onSuccess?.({ id });
            },
          },
        );
      }
    } else {
      return createDraftInfo(
        {
          title: infoFormValues.title,
          content:
            infoFormValues.content !== '' ? infoFormValues.content : '<p></p>',
          thread_id: infoFormValues.thread_id,
        },
        {
          onSuccess: ({ id }: { id: InfoId }) => {
            const infoUpdated: InfoDetailsFormParams = {
              ...infoFormValues,
              infoId: id,
              infoStatus: InfoStatus.DRAFT,
            };
            setDetailsForm(infoUpdated);
            resetDetailsForm?.(infoUpdated);
            onSuccess?.({ id });
          },
        },
      );
    }
  };

  const onSaveDetails = (onSuccess?: () => void) => {
    if (!detailsForm) return;

    createOrUpdateInfo(detailsForm, onSuccess);
  };

  const onNextStep = () => {
    if (detailsForm && detailsFormState.isValid) {
      if (detailsFormState.isDirty || !detailsForm?.infoId) {
        createOrUpdateInfo(detailsForm, ({ id }) => {
          navigate(`/create/info/${id}/rights`, {});
        });
      } else {
        navigate(`./rights`, {
          replace: true,
        });
      }
    }
  };

  return {
    detailsForm,
    detailsFormState,
    resetDetailsForm,
    setDetailsForm,
    setDetailsFormState,
    setResetDetailsForm,
    onSaveDetails,
    onNextStep,
  };
}
