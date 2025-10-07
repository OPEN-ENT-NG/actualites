import { Stepper } from '@edifice.io/react';
import { useI18n } from '~/hooks/useI18n';
import { useCreationStore } from '~/store/creationStore';

export function CreateInfoHeader() {
  const { currentCreationStep } = useCreationStore();
  const { t } = useI18n();
  return (
    <>
      <Stepper
        currentStep={currentCreationStep}
        nbSteps={2}
        color="secondary"
      />
      <h2 className="pt-16">
        {t(`actualites.info.createForm.${currentCreationStep}.title`)}
      </h2>
      <p className="pt-2 text-gray-700">
        {t(`actualites.info.createForm.${currentCreationStep}.subtitle`)}
      </p>
    </>
  );
}
