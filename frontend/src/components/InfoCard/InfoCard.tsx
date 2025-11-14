import { Alert, Card } from '@edifice.io/react';
import clsx from 'clsx';
import { useRef, useState } from 'react';
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
  const cardRef = useRef<HTMLDivElement>(null);

  const isIncoming =
    info.status === InfoStatus.PUBLISHED &&
    !!info.publicationDate &&
    new Date(info.publicationDate) > new Date();
  const isExpired =
    info.status === InfoStatus.PUBLISHED &&
    !!info.expirationDate &&
    new Date(info.expirationDate) < new Date();
  const [collapse, setCollapse] = useState(true);
  const className = clsx(
    'px-24 py-16 info-card position-relative border-none overflow-visible',
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
      if (!collapse && cardRef.current) {
        // Scroll to top of the card when collapsing
        cardRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      return !collapse;
    });
  };

  return (
    <Card
      ref={cardRef}
      className={className}
      isClickable={false}
      isSelectable={false}
      key={info.id}
    >
      <article id={String(info.id)} className="overflow-hidden">
        <InfoCardHeader info={info} extendedStatus={extendedStatus} />

        {isExpired && (
          <Alert type="danger" className="mb-16">
            <div>
              <strong>{t('info.alert.expired.title')}</strong>
            </div>
            <div>{t('actualites.info.status.expired.description')}</div>
          </Alert>
        )}

        <InfoCardContent info={info} collapse />

        <InfoCardFooter info={info} collapse onMoreClick={handleMoreClick} />
      </article>
    </Card>
  );
};
