import clsx from 'clsx';
import { Info } from '~/models/info';
import { InfoCardContent } from './InfoCardContent';
import { InfoCardFooter } from './InfoCardFooter';
import { InfoCardHeader } from './InfoCardHeader';

export type InfoCardProps = {
  info: Info;
  variant: 'read' | 'headline' | 'transparent';
};

export const InfoCard = ({ info, variant = 'transparent' }: InfoCardProps) => {
  const infoId = `info-${info.id}`;
  const className = clsx('mb-16 px-24 py-16', {
    'border info-card-read': variant === 'read',
    'border info-card-headline': variant === 'headline',
  });

  return (
    <article id={infoId} className={className}>
      <InfoCardHeader info={info} />

      <InfoCardContent info={info} />

      <InfoCardFooter info={info} />
    </article>
  );
};
