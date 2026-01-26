import { Button, Divider, Flex } from '@edifice.io/react';
import { ViewsCounter } from '@edifice.io/react/audience';
import { IconRafterDown, IconRafterUp } from '@edifice.io/react/icons';
import { lazy, Suspense } from 'react';
import { useAudienceModal } from '~/hooks/useAudienceModal';
import { useI18n } from '~/hooks/useI18n';
import { useInfoStatus } from '~/hooks/useInfoStatus';
import CommentsCounter from '../comments-counter/CommentsCounter';
import { InfoCardProps } from './InfoCard';

const AudienceModal = lazy(() => import('./AudienceModal'));

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
  const {
    viewsCounter,
    isAudienceOpen,
    handleViewsCounterClick,
    handleModalClose,
  } = useAudienceModal(info);

  return (
    <footer className="mt-12">
      <Flex align="center" justify="between">
        <Flex align="center">
          <ViewsCounter
            viewsCounter={viewsCounter}
            onClick={handleViewsCounterClick}
          />
          {canShowComments && <Divider vertical className="border-gray-700" />}
          {canShowComments && (
            <CommentsCounter
              commentsCounter={info.numberOfComments}
              aria-controls={`info-${info.id}-comments`}
              aria-expanded={!collapse}
              onClick={handleCommentsClick}
            />
          )}
        </Flex>
        <Button
          data-testid={
            collapse ? 'info-view-more-button' : 'info-view-less-button'
          }
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

      {isAudienceOpen && (
        <Suspense fallback={<>{/*TODO skeleton*/}</>}>
          <AudienceModal infoId={info.id} onModalClose={handleModalClose} />
        </Suspense>
      )}
    </footer>
  );
};
