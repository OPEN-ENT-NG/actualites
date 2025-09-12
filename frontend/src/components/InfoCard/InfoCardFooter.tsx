import { Button, Flex } from '@edifice.io/react';
import { IconRafterDown } from '@edifice.io/react/icons';
import { useTranslation } from 'react-i18next';
import { InfoCardProps } from './InfoCard';

export const InfoCardFooter = ({
  info: _info,
  onMoreClick,
}: Pick<InfoCardProps, 'info'> & { onMoreClick: () => void }) => {
  const { t } = useTranslation();
  const icon = <IconRafterDown></IconRafterDown>;
  return (
    <footer className="mt-12">
      <Flex align="center" justify="between">
        <div>
          {/* <SeparatedInfo>
          // TODO : nombre de vues
          // TODO : nombre de commentaires
          </SeparatedInfo> */}
        </div>
        <Button
          type="button"
          color="secondary"
          variant="ghost"
          size="sm"
          rightIcon={icon}
          className="btn-icon"
          onClick={onMoreClick}
        >
          {t('actualites.read.more')}
        </Button>
      </Flex>
    </footer>
  );
};
