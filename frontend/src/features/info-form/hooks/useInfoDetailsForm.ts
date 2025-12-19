import { useToast } from '@edifice.io/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '~/hooks/useI18n';
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
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  const { t } = useI18n();

  const createOrUpdateInfo = (
    infoFormValues: InfoDetailsFormParams,
    onSuccess?: ({ id }: { id: InfoId }) => void,
  ) => {
    if (!infoFormValues.thread_id) {
      console.error('Thread ID is undefined');
      return;
    }
    setIsSaving(true);
    if (infoFormValues.infoId) {
      return updateDraftInfo(
        {
          infoId: infoFormValues.infoId,
          infoStatus: InfoStatus.DRAFT,
          payload: {
            thread_id: infoFormValues.thread_id,
            content: infoFormValues.content,
            title: infoFormValues.title,
            is_headline: infoFormValues.headline,
          },
        },
        {
          onSuccess: ({ id }: { id: InfoId }) => {
            setIsSaving(false);
            resetDetailsForm?.();
            toast.success(t('actualites.info.createForm.draftSaved'));
            onSuccess?.({ id });
          },
        },
      );
    } else {
      return createDraftInfo(
        {
          title: infoFormValues.title,
          content:
            infoFormValues.content !== '' ? infoFormValues.content : '<p></p>',
          thread_id: infoFormValues.thread_id,
          is_headline: infoFormValues.headline,
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
            toast.success(t('actualites.info.createForm.draftSaved'));
            setIsSaving(false);
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
    isSaving,
  };
}
