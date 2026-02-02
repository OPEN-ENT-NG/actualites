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
  const { t } = useI18n();
  const toast = useToast();
  const { mutate: createDraftInfo } = useCreateDraftInfo();
  const { mutate: updateDraftInfo } = useUpdateInfo();
  const [isSaving, setIsSaving] = useState(false);

  const createOrUpdateInfo = (
    infoFormValues: InfoDetailsFormParams,
    onSuccess?: ({ id }: { id: InfoId }) => void,
  ) => {
    if (!infoFormValues.thread_id) {
      console.error('Thread ID is undefined');
      return;
    }
    if (!infoFormValues.infoStatus) {
      infoFormValues.infoStatus = InfoStatus.DRAFT;
    }

    setIsSaving(true);
    if (infoFormValues.infoId) {
      return updateDraftInfo(
        {
          infoId: infoFormValues.infoId,
          infoStatus: infoFormValues.infoStatus,
          payload: {
            thread_id: Number(infoFormValues.thread_id),
            content: infoFormValues.content,
            title: infoFormValues.title,
            is_headline: infoFormValues.headline,
            publication_date: infoFormValues.publicationDate?.toISOString(),
            expiration_date: infoFormValues.expirationDate?.toISOString(),
          },
        },
        {
          onSuccess: ({ id }: { id: InfoId }) => {
            setIsSaving(false);
            resetDetailsForm?.();
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
          thread_id: Number(infoFormValues.thread_id),
          publication_date: infoFormValues.publicationDate?.toISOString(),
          expiration_date: infoFormValues.expirationDate?.toISOString(),
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
          toast.success(t('actualites.info.createForm.draftSaved'));
          navigate(`/infos/${id}/create/rights`, {});
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
