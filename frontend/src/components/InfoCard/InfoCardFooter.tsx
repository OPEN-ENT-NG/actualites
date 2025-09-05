import { Flex } from '@edifice.io/react';
import { InfoCardProps } from './InfoCard';

export const InfoCardFooter = ({ info }: Pick<InfoCardProps, 'info'>) => {
  return (
    <footer>
      <Flex align="center" justify="between"></Flex>
    </footer>
  );
};
