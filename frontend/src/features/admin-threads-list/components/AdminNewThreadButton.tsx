import { Button } from '@edifice.io/react';
import { IconPlus } from '@edifice.io/react/icons';
import { useState } from 'react';
import { useI18n } from '~/hooks/useI18n';
import { AdminThreadModal } from './AdminThreadModal';

export function AdminNewThreadButton() {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNewThreadClick = () => {
    // Logic to open the new thread creation modal or navigate to the creation page
    setIsModalOpen(true);
  };

  return (
    <>
      <Button
        data-testid="admin-thread-create-button"
        leftIcon={<IconPlus />}
        onClick={handleNewThreadClick}
      >
        {t('actualites.adminThreads.newThread')}
      </Button>
      {isModalOpen && (
        <AdminThreadModal
          isOpen={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
