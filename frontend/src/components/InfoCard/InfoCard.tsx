import { Card } from '@edifice.io/react';
import clsx from 'clsx';
import { useState } from 'react';
import { Info, InfoStatus } from '~/models/info';
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
  const infoId = `info-${info.id}`;
  const isIncoming =
    info.status === InfoStatus.PUBLISHED &&
    !!info.publicationDate &&
    new Date(info.publicationDate) > new Date();
  const className = clsx(
    'mb-16 px-24 py-16 info-card position-relative border-none overflow-visible',
    {
      'info-card-incoming': isIncoming,
      'info-card-draft': info.status === InfoStatus.DRAFT,
      'info-card-pending': info.status === InfoStatus.PENDING,
      'info-card-headline': info.headline,
    },
  );
  const [collapse, setCollapse] = useState(true);

  const handleMoreClick = () => {
    setCollapse(!collapse);
  };

  return (
    <Card className={className} isClickable={false} isSelectable={false}>
      <article id={infoId} className="overflow-hidden">
        <InfoCardHeader info={info} isIncoming={isIncoming} />

        <InfoCardContent info={info} collapse={collapse} />

        <InfoCardFooter info={info} onMoreClick={handleMoreClick} />
      </article>
    </Card>
  );
};
