import { Button } from '@edifice.io/react';
import { IconPlus } from '@edifice.io/react/icons';
import { useI18n } from '~/hooks/useI18n';

export function AdminNewThreadButton() {
  const { t } = useI18n();

  const handleNewThreadClick = () => {
    // Logic to open the new thread creation modal or navigate to the creation page
  };

  return (
    <Button leftIcon={<IconPlus />} onClick={handleNewThreadClick}>
      {t('actualites.adminThreads.newThread')}
    </Button>
  );
}
