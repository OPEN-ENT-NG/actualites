import { Alert, Card } from '@edifice.io/react';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { useI18n } from '~/hooks/useI18n';
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
        setScrollTo(`info-${info.id}`);
      }
      return !collapse;
    });
  };

  const handleCommentsClick = () => {
    setCollapse((collapse) => {
      if (!collapse) {
        // Scroll to top of the card when collapsing
        setScrollTo(`info-${info.id}`);
      } else {
        // Scroll to top comment when expanding
        setScrollTo(`info-${info.id}-comments`);
      }
      return !collapse;
    });
  };

  const handleCollapseApplied = useCallback(() => {
    if (scrollTo) {
      const ref = document.getElementById(scrollTo);
      if (ref) {
        ref.scrollIntoView();
      }
      setScrollTo(undefined);
    }
  }, [scrollTo]);

  return (
    <Card
      className={className}
      isClickable={false}
      isSelectable={false}
      key={info.id}
    >
      <article id={`info-${info.id}`} className="overflow-hidden">
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
