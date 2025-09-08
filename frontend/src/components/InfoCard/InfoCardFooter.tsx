import { Button, Flex } from '@edifice.io/react';
import { IconRafterDown } from '@edifice.io/react/icons';
import { useTranslation } from 'react-i18next';
import { SeparatedInfo } from '../SeparatedInfo';
import { InfoCardProps } from './InfoCard';

export const InfoCardFooter = ({ info }: Pick<InfoCardProps, 'info'>) => {
  const { t } = useTranslation();
  const icon = <IconRafterDown></IconRafterDown>;
  return (
    <footer className="mt-12">
      <Flex align="center" justify="between">
        <SeparatedInfo>
          <span>{/*TODO : nombre de vues */}</span>
          <span>{/*TODO : nombre de commentaires */}</span>
        </SeparatedInfo>
        <Button
          type="button"
          color="secondary"
          variant="ghost"
          size="sm"
          rightIcon={icon}
          className="btn-icon"
        >
          {t('actualites.read.more')}
        </Button>
      </Flex>
    </footer>
  );
};
