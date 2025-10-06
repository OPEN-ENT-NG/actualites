import { Stepper } from '@edifice.io/react';
import { useI18n } from '~/hooks/useI18n';

export function CreateInfoHeader() {
  const { t } = useI18n();
  return (
    <>
      <Stepper currentStep={0} nbSteps={2} color="secondary" />
      <h2 className="pt-16">{t('actualites.info.createForm.title')}</h2>
      <p className="pt-2 text-gray-700">
        {t('actualites.info.createForm.subtitle')}
      </p>
    </>
  );
}
