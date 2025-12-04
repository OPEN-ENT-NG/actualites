import { Button, Flex, SeparatedInfo } from '@edifice.io/react';
import { ViewsCounter } from '@edifice.io/react/audience';
import { IconRafterDown, IconRafterUp } from '@edifice.io/react/icons';
import { useI18n } from '~/hooks/useI18n';
import { useInfoUserRights } from '~/hooks/useInfoUserRights';
import CommentsCounter from '../comments-counter/CommentsCounter';
import { InfoCardProps } from './InfoCard';

export const InfoCardFooter = ({
  info,
  collapse,
  handleMoreClick,
  handleCommentsClick,
}: Pick<InfoCardProps, 'info'> & {
  handleMoreClick: () => void;
  handleCommentsClick: () => void;
  collapse: boolean;
}) => {
  const { t } = useI18n();
  const { canComment } = useInfoUserRights(info);
  return (
    <footer className="mt-12">
      <Flex align="center" justify="between">
        {info.numberOfComments > 0 || canComment ? (
          <SeparatedInfo>
            <ViewsCounter viewsCounter={0} />
            <CommentsCounter
              commentsCounter={info.numberOfComments}
              aria-controls={`info-${info.id}-comments`}
              aria-expanded={!collapse}
              onClick={handleCommentsClick}
            />
          </SeparatedInfo>
        ) : (
          <ViewsCounter viewsCounter={0} />
        )}

        <Button
          type="button"
          color="secondary"
          variant="ghost"
          size="sm"
          rightIcon={collapse ? <IconRafterDown /> : <IconRafterUp />}
          className="btn-icon"
          onClick={handleMoreClick}
          aria-controls={`info-${info.id}-content`}
          aria-expanded={!collapse}
        >
          {t(collapse ? 'actualites.read.more' : 'actualites.read.less')}
        </Button>
      </Flex>
    </footer>
  );
};
