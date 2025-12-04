import { Alert, Card } from '@edifice.io/react';
import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '~/hooks/useI18n';
import { useScrollToElement } from '~/hooks/useScrollToElement';
import { Info, InfoExtendedStatus, InfoStatus } from '~/models/info';
import './InfoCard.css';
import { InfoCardContent } from './InfoCardContent';
import { InfoCardFooter } from './InfoCardFooter';
import { InfoCardHeader } from './InfoCardHeader';

export type InfoCardProps = {
  /**
   * Information to display in the card
   */
  info: Info;
};

export const InfoCard = ({ info }: InfoCardProps) => {
  const { t } = useI18n();
  const { scrollIntoView, hash } = useScrollToElement();

  const isIncoming =
    info.status === InfoStatus.PUBLISHED &&
    !!info.publicationDate &&
    new Date(info.publicationDate) > new Date();
  const isExpired =
    info.status === InfoStatus.PUBLISHED &&
    !!info.expirationDate &&
    new Date(info.expirationDate) < new Date();

  const [collapse, setCollapse] = useState(true);
  const [scrollTo, setScrollTo] = useState<string>();

  const id = `info-${info.id}`;

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

  let extendedStatus: InfoExtendedStatus | undefined;
  if (isIncoming) {
    extendedStatus = InfoExtendedStatus.INCOMING;
  } else if (isExpired) {
    extendedStatus = InfoExtendedStatus.EXPIRED;
  } else {
    extendedStatus = undefined;
  }

  const handleMoreClick = () => {
    setCollapse((collapse) => {
      if (!collapse) {
        // Scroll to top of the card when collapsing
        setScrollTo(id);
      }
      return !collapse;
    });
  };

  const handleCommentsClick = () => {
    setCollapse((collapse) => {
      if (!collapse) {
        // Scroll to top of the card when collapsing
        setScrollTo(id);
      } else {
        // Scroll to top comment when expanding
        setScrollTo(id + '-comments');
      }
      return !collapse;
    });
  };

  const handleCollapseApplied = useCallback(() => {
    if (scrollTo) {
      scrollIntoView(scrollTo);
      setScrollTo(undefined);
    }
  }, [scrollTo]);

  useEffect(() => {
    id === hash && scrollIntoView(hash);
  }, []);

  return (
    <Card
      className={className}
      isClickable={false}
      isSelectable={false}
      key={info.id}
    >
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
