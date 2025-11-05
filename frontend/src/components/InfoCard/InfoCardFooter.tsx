import { Button, Flex, SeparatedInfo } from '@edifice.io/react';
import { ViewsCounter } from '@edifice.io/react/audience';
import { IconRafterDown, IconRafterUp } from '@edifice.io/react/icons';
import { useI18n } from '~/hooks/useI18n';
import CommentsCounter from '../comments-counter/CommentsCounter';
import { InfoCardProps } from './InfoCard';

export const InfoCardFooter = ({
  info,
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
        <SeparatedInfo>
          <ViewsCounter viewsCounter={0} />
          <CommentsCounter
            commentsCounter={info.numberOfComments}
            onClick={onMoreClick}
          />
        </SeparatedInfo>

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
