import { Button, Flex } from '@edifice.io/react';
import { IconRafterDown } from '@edifice.io/react/icons';
import { SeparatedInfo } from '../SeparatedInfo';
import { InfoCardProps } from './InfoCard';

export const InfoCardFooter = ({ info }: Pick<InfoCardProps, 'info'>) => {
  const icon = <IconRafterDown></IconRafterDown>;
  return (
    <footer className="mt-12">
      <Flex align="center" justify="between">
        <SeparatedInfo>
          <span>20 👁️</span>
          <span>3 💬</span>
        </SeparatedInfo>
        <Button
          type="button"
          color="secondary"
          variant="ghost"
          size="sm"
          rightIcon={icon}
          className="btn-icon"
        >
          Lire la suite
        </Button>
      </Flex>
    </footer>
  );
};
