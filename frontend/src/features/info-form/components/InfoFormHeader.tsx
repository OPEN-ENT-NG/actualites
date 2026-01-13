import { Flex, Stepper } from '@edifice.io/react';
import { useI18n } from '~/hooks/useI18n';
import { InfoWorkflowStep, useInfoFormStore } from '~/store/infoFormStore';
import { useInfoForm } from '../hooks/useInfoForm';

export function InfoFormHeader({ className }: { className?: string }) {
  const currentCreationStep = useInfoFormStore.use.currentWorkflowStep();
  const { t } = useI18n();
  const { type } = useInfoForm();

  const currentStepTitle =
    currentCreationStep === InfoWorkflowStep.INFO_DETAILS
      ? 'details'
      : 'rights';

  return (
    <Flex direction="column" gap="16" className={className}>
      {(type === 'create' || type === 'publish') && (
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
            : type === 'edit'
              ? t(`actualites.info.editForm.title`)
              : t(`actualites.info.publishForm.${currentStepTitle}.title`)}
        </h2>
        <p className=" text-gray-700">
          {type === 'create'
            ? t(`actualites.info.createForm.${currentStepTitle}.subtitle`)
            : type === 'edit'
              ? t(`actualites.info.editForm.subtitle`)
              : t(`actualites.info.publishForm.${currentStepTitle}.subtitle`)}
        </p>
      </Flex>
    </Flex>
  );
}
