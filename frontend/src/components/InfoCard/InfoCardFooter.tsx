import { Button, Flex } from '@edifice.io/react';
import { IconRafterDown, IconRafterUp } from '@edifice.io/react/icons';
import { useI18n } from '~/hooks/useI18n';
import { useInfoStatus } from '~/hooks/useInfoStatus';
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
  const { canShowComments } = useInfoStatus(info);

  return (
    <footer className="mt-12">
      <Flex align="center" justify="between">
        <Flex align="center">
          {/* To be implemented later 
          <ViewsCounter viewsCounter={0} /> */}
          <>
            {/* <Divider vertical /> */}
            {canShowComments && (
              <CommentsCounter
                commentsCounter={info.numberOfComments}
                aria-controls={`info-${info.id}-comments`}
                aria-expanded={!collapse}
                onClick={handleCommentsClick}
              />
            )}
          </>
        </Flex>
        <Button
          data-testid="info-view-more-button"
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
