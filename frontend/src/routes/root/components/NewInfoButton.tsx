import { Button } from '@edifice.io/react';
import { IconPlus } from '@edifice.io/react/icons';
import { useMatches, useNavigate } from 'react-router-dom';
import { useI18n } from '~/hooks/useI18n';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';

export const NewInfoButton = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { threadId } = useThreadInfoParams();
  const matches = useMatches();

  const visible = !matches.find((route) => route.id === 'EditInfo');

  const handleClickNewInfo = () => {
    navigate({
      pathname: '/create/info',
      search: threadId ? `?thread-id=${threadId}` : undefined,
    });
  };

  return (
    visible && (
      <Button
        data-testid="new-info-button"
        onClick={handleClickNewInfo}
        leftIcon={<IconPlus />}
      >
        {t('actualites.info.create')}
      </Button>
    )
  );
};
