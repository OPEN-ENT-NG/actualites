import { useI18n } from '~/hooks/useI18n';

import { Button, Flex, useBreakpoint } from '@edifice.io/react';
import { IconArrowRight, IconSave } from '@edifice.io/react/icons';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreationStep, useInfoFormStore } from '~/store/infoFormStore';
import { useInfoDetailsForm } from '../hooks/useInfoDetailsForm';

export function InfoFormActions() {
  const { t } = useI18n();
  const { md } = useBreakpoint();
  const currentCreationStep = useInfoFormStore.use.currentCreationStep();
  const { detailsForm, detailsFormState, onSaveDetails, onNextStep } =
    useInfoDetailsForm();
  const navigate = useNavigate();

  const isInfoDetailsStep = currentCreationStep === CreationStep.INFO_DETAILS;

  const disableSaveDraft = useMemo(() => {
    if (isInfoDetailsStep) {
      return (
        !detailsForm ||
        detailsForm?.thread_id === undefined ||
        !detailsFormState?.isDirty
      );
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCreationStep, detailsForm, detailsFormState]);

  const handleCancelClick = () => {
    if (isInfoDetailsStep) {
      window.history.back();
    } else {
      navigate('..', { relative: 'path' });
    }
  };

  const handleSaveDraftClick = () => {
    onSaveDetails(() => {
      navigate('/');
    });
  };

  const handleSubmitClick = () => {
    if (currentCreationStep === CreationStep.INFO_DETAILS) {
      onNextStep();
    } else {
      onSaveDetails(() => {
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
      wrap="reverse"
    >
      <Button color="primary" variant="ghost" onClick={handleCancelClick}>
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
        >
          {t('actualites.info.createForm.saveDraft')}
        </Button>
        <Button
          color="primary"
          type="submit"
          rightIcon={<IconArrowRight />}
          onClick={handleSubmitClick}
          disabled={!detailsFormState.isValid}
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
