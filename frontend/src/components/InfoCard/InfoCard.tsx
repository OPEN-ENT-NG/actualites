import clsx from 'clsx';
import { Info } from '~/models/info';
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
  const className = clsx('mb-16 px-24 py-16');

  return (
    <article id={infoId} className={className}>
      <InfoCardHeader info={info} />

      <InfoCardContent info={info} />

      <InfoCardFooter info={info} />
    </article>
  );
};
