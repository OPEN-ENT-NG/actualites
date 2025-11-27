import { useI18n } from '~/hooks/useI18n';

import { Button, Flex, useBreakpoint } from '@edifice.io/react';
import { IconArrowRight, IconSave } from '@edifice.io/react/icons';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfoFormStore } from '~/store/infoFormStore';
import { useInfoDetailsForm } from '../hooks/useInfoDetailsForm';

export function InfoDetailsFormActions() {
  const { t } = useI18n();
  const { md } = useBreakpoint();
  const navigate = useNavigate();

  const currentCreationStep = useInfoFormStore.use.currentCreationStep();

  const { detailsForm, detailsFormState, onSaveDetails, onNextStep, isSaving } =
    useInfoDetailsForm();

  const disableSaveDraft = useMemo(() => {
    return (
      !detailsForm ||
      detailsForm?.thread_id === undefined ||
      !detailsFormState?.isDirty
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCreationStep, detailsForm, detailsFormState]);

  const handleCancelClick = () => {
    window.history.back();
  };

  const handleSaveDraftClick = () => {
    onSaveDetails(() => {
      navigate('/');
    });
  };

  const handleSubmitClick = () => {
    onNextStep();
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
        disabled={isSaving}
      >
        {t('actualites.info.createForm.cancel')}
      </Button>
      <Flex gap="12">
        <Button
          color="primary"
          variant="outline"
          type="submit"
          leftIcon={<IconSave />}
          onClick={handleSaveDraftClick}
          disabled={disableSaveDraft || isSaving}
          data-testid="actualites.info.form.saveDraftButton"
          isLoading={isSaving}
        >
          {t('actualites.info.createForm.saveDraft')}
        </Button>
        <Button
          color="primary"
          type="submit"
          rightIcon={<IconArrowRight />}
          onClick={handleSubmitClick}
          disabled={!detailsFormState?.isValid || isSaving}
          data-testid="actualites.info.form.submitButton"
        >
          {t('actualites.info.createForm.nextStep')}
        </Button>
      </Flex>
    </Flex>
  );
}
