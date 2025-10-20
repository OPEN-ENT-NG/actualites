import { Button, Flex } from '@edifice.io/react';
import { IconRafterDown, IconRafterUp } from '@edifice.io/react/icons';
import { useI18n } from '~/hooks/useI18n';
import { InfoCardProps } from './InfoCard';

export const InfoCardFooter = ({
  info: _info,
  collapse,
  onMoreClick,
}: Pick<InfoCardProps, 'info'> & {
  onMoreClick: () => void;
  collapse: boolean;
}) => {
  const { t } = useI18n();
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
          rightIcon={collapse ? <IconRafterDown /> : <IconRafterUp />}
          className="btn-icon"
          onClick={onMoreClick}
        >
          {t(collapse ? 'actualites.read.more' : 'actualites.read.less')}
        </Button>
      </Flex>
    </footer>
  );
};
