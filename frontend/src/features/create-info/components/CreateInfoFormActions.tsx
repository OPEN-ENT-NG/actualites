import { useI18n } from '~/hooks/useI18n';

import { Button, Flex, useBreakpoint } from '@edifice.io/react';
import { IconArrowRight, IconSave } from '@edifice.io/react/icons';
import { useCreationStore } from '~/store/creationStore';
import { useCreateInfo } from '../hooks/useCreateInfo';
import { CreateInfoFormActionsSkeleton } from './CreateInfoFormActionsSkeleton';

export function CreateInfoFormActions() {
  const { t } = useI18n();
  const { md } = useBreakpoint();
  const { infoForm } = useCreationStore();
  const { onSaveDraft, onNextStep } = useCreateInfo();

  if (!infoForm) {
    return <CreateInfoFormActionsSkeleton />;
  }

  return (
    <Flex
      direction={md ? 'row' : 'column-reverse'}
      justify="end"
      align={md ? 'center' : 'end'}
      gap="12"
      wrap="reverse"
    >
      <Button color="primary" variant="ghost">
        {t('actualites.info.createForm.cancel')}
      </Button>
      <Flex gap="12">
        <Button
          color="primary"
          variant="outline"
          type="submit"
          leftIcon={<IconSave />}
          onClick={onSaveDraft}
          disabled={
            !infoForm.isDirty || infoForm.values.thread_id === undefined
          }
        >
          {t('actualites.info.createForm.saveDraft')}
        </Button>
        <Button
          color="primary"
          type="submit"
          rightIcon={<IconArrowRight />}
          onClick={onNextStep}
          disabled={!infoForm.isValid}
        >
          {t('actualites.info.createForm.nextStep')}
        </Button>
      </Flex>
    </Flex>
  );
}
