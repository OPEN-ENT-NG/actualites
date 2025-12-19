import { Button } from '@edifice.io/react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '~/hooks/useI18n';
import { IconPlus } from '@edifice.io/react/icons';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';

export const NewInfoButton = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { threadId } = useThreadInfoParams();

  const handleClickNewInfo = () => {
    navigate({
      pathname: '/create/info',
      search: threadId ? `?thread-id=${threadId}` : undefined,
    });
  };

  return (
    <Button onClick={handleClickNewInfo} leftIcon={<IconPlus />}>
      {t('actualites.info.create')}
    </Button>
  );
};
