import clsx from 'clsx';
import { Info } from '~/models/info';
import { InfoCardContent } from './InfoCardContent';
import { InfoCardFooter } from './InfoCardFooter';
import { InfoCardHeader } from './InfoCardHeader';

export type InfoCardProps = {
  info: Info;
  color: 'read' | 'unread' | 'transparent';
};

export const InfoCard = ({ info, color = 'transparent' }: InfoCardProps) => {
  const infoId = `info-${info.id}`;
  const className = clsx('mb-16', {
    'bc-primary': color === 'read',
    'bc-secondary': color === 'unread',
  });

  return (
    <article id={infoId} className={className}>
      <InfoCardHeader info={info} />

      <InfoCardContent info={info} />

      <InfoCardFooter info={info} />
    </article>
  );
};
