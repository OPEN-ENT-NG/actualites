import { Flex, Stepper } from '@edifice.io/react';
import { useI18n } from '~/hooks/useI18n';
import { useCreationStore } from '~/store/creationStore';

export function CreateInfoFormHeader() {
  const { currentCreationStep } = useCreationStore();
  const { t } = useI18n();
  return (
    <Flex direction="column" gap="16">
      <Stepper
        currentStep={currentCreationStep}
        nbSteps={2}
        color="secondary"
      />
      <Flex direction="column" gap="2">
        <h2>{t(`actualites.info.createForm.${currentCreationStep}.title`)}</h2>
        <p className=" text-gray-700">
          {t(`actualites.info.createForm.${currentCreationStep}.subtitle`)}
        </p>
      </Flex>
    </Flex>
  );
}
