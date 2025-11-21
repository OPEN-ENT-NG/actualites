import { Flex, Stepper } from '@edifice.io/react';
import { useI18n } from '~/hooks/useI18n';
import { CreationStep, useInfoFormStore } from '~/store/infoFormStore';

export function InfoFormHeader() {
  const currentCreationStep = useInfoFormStore.use.currentCreationStep();
  const { t } = useI18n();
  const currentStepTitle =
    currentCreationStep === CreationStep.INFO_DETAILS ? 'details' : 'rights';
  return (
    <Flex direction="column" gap="16">
      <Stepper
        currentStep={currentCreationStep}
        nbSteps={2}
        color="secondary"
      />
      <Flex direction="column" gap="2">
        <h2>{t(`actualites.info.createForm.${currentStepTitle}.title`)}</h2>
        <p className=" text-gray-700">
          {t(`actualites.info.createForm.${currentStepTitle}.subtitle`)}
        </p>
      </Flex>
    </Flex>
  );
}
