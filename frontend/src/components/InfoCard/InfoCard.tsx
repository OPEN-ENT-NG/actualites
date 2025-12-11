import { Alert, Card } from '@edifice.io/react';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { useI18n } from '~/hooks/useI18n';
import { useInfoStatus } from '~/hooks/useInfoStatus';
import { useScrollToElement } from '~/hooks/useScrollToElement';
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
  const { deferScrollIntoView } = useScrollToElement();
  const [collapse, setCollapse] = useState(true);
  const [scrollTo, setScrollTo] = useState<string>();

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

        {isExpired && (
          <Alert type="danger" className="mb-16">
            <div>
              <strong>{t('info.alert.expired.title')}</strong>
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
