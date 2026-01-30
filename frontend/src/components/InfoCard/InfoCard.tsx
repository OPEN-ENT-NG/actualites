import { Alert, Card, useDate } from '@edifice.io/react';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { useAudience } from '~/hooks/useAudience';
import { useHashScrolling } from '~/hooks/useHashScrolling';
import { useI18n } from '~/hooks/useI18n';
import { useInfoStatus } from '~/hooks/useInfoStatus';
import { Info, InfoStatus } from '~/models/info';
import './InfoCard.css';
import { InfoCardContent } from './InfoCardContent';
import { InfoCardFooter } from './InfoCardFooter';
import { InfoCardHeader } from './InfoCardHeader';

export type InfoCardProps = {
  /** Information to display in the card */
  info: Info;
  /** ID of the HTML element */
  id?: string;
};

export const InfoCard = ({ info, id }: InfoCardProps) => {
  const { t } = useI18n();
  const { isIncoming, isExpired, extendedStatus } = useInfoStatus(info);
  const { hash, deferScrollIntoView } = useHashScrolling();
  const [collapse, setCollapse] = useState(hash !== id);
  const [scrollTo, setScrollTo] = useState<string>();
  const { formatDate } = useDate();
  const { incrementViewsCounter } = useAudience(info);

  const className = clsx(
    'px-16 px-md-24 py-16 info-card position-relative border-none overflow-visible',
    {
      'info-card-incoming': isIncoming,
      'info-card-draft': info.status === InfoStatus.DRAFT,
      'info-card-pending': info.status === InfoStatus.PENDING,
      'info-card-headline': info.headline,
      'info-card-expired': isExpired,
      'info-card-full-content': !collapse,
    },
  );

  const handleMoreClick = () => {
    setCollapse((collapse) => {
      if (!collapse) {
        // Scroll to top of the card when collapsing
        id && setScrollTo(id);
      } else {
        // COCO-4432, trigger a view
        incrementViewsCounter();
      }
      return !collapse;
    });
  };

  const handleCommentsClick = () => {
    setCollapse((collapse) => {
      if (!collapse) {
        // Scroll to top of the card when collapsing
        id && setScrollTo(id);
      } else {
        // Scroll to top comment when expanding
        id && setScrollTo(id + '-comments');
        // COCO-4432, trigger a view
        incrementViewsCounter();
      }
      return !collapse;
    });
  };

  const handleCollapseApplied = useCallback(() => {
    if (scrollTo) {
      deferScrollIntoView(scrollTo);
      setScrollTo(undefined);
    }
  }, [scrollTo]);

  return (
    <Card className={className} isClickable={false} isSelectable={false}>
      <article id={id} className="overflow-hidden" data-testid="info-card">
        <InfoCardHeader info={info} extendedStatus={extendedStatus} />

        {isExpired && info.expirationDate && (
          <Alert type="danger" className="mb-16">
            <div>
              <strong>
                {t('actualites.info.alert.expired.message', {
                  expiredDate: formatDate(
                    info.expirationDate,
                    t('actualites.info.alert.expired.message.date.format'),
                  ),
                })}
              </strong>
            </div>
            <div>{t('actualites.info.status.expired.description')}</div>
          </Alert>
        )}

        <InfoCardContent
          info={info}
          collapse={collapse}
          onCollapseApplied={handleCollapseApplied}
        />

        <InfoCardFooter
          info={info}
          collapse={collapse}
          handleMoreClick={handleMoreClick}
          handleCommentsClick={handleCommentsClick}
        />
      </article>
    </Card>
  );
};
