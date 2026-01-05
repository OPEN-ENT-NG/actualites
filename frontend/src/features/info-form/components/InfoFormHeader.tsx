import { Flex, Stepper } from '@edifice.io/react';
import { useI18n } from '~/hooks/useI18n';
import { CreationStep, useInfoFormStore } from '~/store/infoFormStore';
import { useInfoForm } from '../hooks/useInfoForm';

export function InfoFormHeader() {
  const currentCreationStep = useInfoFormStore.use.currentCreationStep();
  const { t } = useI18n();
  const { type } = useInfoForm();

  const currentStepTitle =
    currentCreationStep === CreationStep.INFO_DETAILS ? 'details' : 'rights';

  return (
    <Flex direction="column" gap="16" className="mb-24">
      {type === 'create' && (
        <Stepper
          currentStep={currentCreationStep}
          nbSteps={2}
          color="secondary"
        />
      )}
      <Flex direction="column" gap="2">
        <h2>
          {type === 'create'
            ? t(`actualites.info.createForm.${currentStepTitle}.title`)
            : t(`actualites.info.editForm.title`)}
        </h2>
        <p className=" text-gray-700">
          {type === 'create'
            ? t(`actualites.info.createForm.${currentStepTitle}.subtitle`)
            : t(`actualites.info.editForm.subtitle`)}
        </p>
      </Flex>
    </Flex>
  );
}
