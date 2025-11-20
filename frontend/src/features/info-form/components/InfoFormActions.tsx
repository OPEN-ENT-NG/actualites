import { useI18n } from '~/hooks/useI18n';

import { Button, Flex, useBreakpoint, useToast } from '@edifice.io/react';
import {
  IconArrowLeft,
  IconArrowRight,
  IconSave,
} from '@edifice.io/react/icons';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreationStep, useInfoFormStore } from '~/store/infoFormStore';
import { useInfoDetailsForm } from '../hooks/useInfoDetailsForm';
import { useInfoSharesForm } from '../hooks/useInfoSharesForm';

export function InfoFormActions() {
  const { t } = useI18n();
  const { md } = useBreakpoint();
  const currentCreationStep = useInfoFormStore.use.currentCreationStep();
  const { detailsForm, detailsFormState, onSaveDetails, onNextStep } =
    useInfoDetailsForm();
  const {
    setInfoSharesFormDirty,
    isInfoSharesFormDirty,
    updateSharesInfo,
    onPublish,
  } = useInfoSharesForm();
  const navigate = useNavigate();
  const toast = useToast();

  const isInfoDetailsStep = useMemo(
    () => currentCreationStep === CreationStep.INFO_DETAILS,
    [currentCreationStep],
  );

  const disableSaveDraft = useMemo(() => {
    if (isInfoDetailsStep) {
      return (
        !detailsForm ||
        detailsForm?.thread_id === undefined ||
        !detailsFormState?.isDirty
      );
    } else {
      return !isInfoSharesFormDirty;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentCreationStep,
    detailsForm,
    detailsFormState,
    isInfoSharesFormDirty,
  ]);

  const handleCancelClick = () => {
    if (isInfoDetailsStep) {
      window.history.back();
    } else {
      navigate('..', { relative: 'path' });
    }
  };

  const handleSaveDraftClick = () => {
    if (isInfoDetailsStep) {
      onSaveDetails(() => {
        toast.success(t('actualites.info.createForm.draftSaved'));
        navigate('/');
      });
    } else {
      updateSharesInfo(() => {
        toast.success(t('actualites.info.createForm.draftSaved'));
        setInfoSharesFormDirty(false);
        navigate('/');
      });
    }
  };

  const handleSubmitClick = () => {
    if (isInfoDetailsStep) {
      onNextStep();
    } else {
      onPublish(() => {
        toast.success(t('actualites.info.createForm.infoPublished'));
        navigate('/');
      });
    }
  };

  return (
    <Flex
      direction={md ? 'row' : 'column-reverse'}
      justify="end"
      align={md ? 'center' : 'end'}
      gap="12"
      className="mb-48"
    >
      <Button
        color="primary"
        variant="ghost"
        onClick={handleCancelClick}
        data-testid="actualites.info.form.cancelButton"
        leftIcon={!isInfoDetailsStep ? <IconArrowLeft /> : undefined}
      >
        {t(
          isInfoDetailsStep
            ? 'actualites.info.createForm.cancel'
            : 'actualites.info.createForm.previousStep',
        )}
      </Button>
      <Flex gap="12">
        <Button
          color="primary"
          variant="outline"
          type="submit"
          leftIcon={<IconSave />}
          onClick={handleSaveDraftClick}
          disabled={disableSaveDraft}
          data-testid="actualites.info.form.saveDraftButton"
        >
          {t('actualites.info.createForm.saveDraft')}
        </Button>
        <Button
          color="primary"
          type="submit"
          rightIcon={<IconArrowRight />}
          onClick={handleSubmitClick}
          disabled={
            isInfoDetailsStep
              ? !detailsFormState?.isValid
              : !isInfoSharesFormDirty
          }
          data-testid="actualites.info.form.submitButton"
        >
          {t(
            isInfoDetailsStep
              ? 'actualites.info.createForm.nextStep'
              : 'actualites.info.createForm.publish',
          )}
        </Button>
      </Flex>
    </Flex>
  );
}
