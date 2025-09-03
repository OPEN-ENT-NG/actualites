import { Info } from '~/models/info';
import { InfoCardContent } from './InfoCardContent';
import { InfoCardHeader } from './InfoCardHeader';

export type InfoCardProps = {
  info: Info;
};

export const InfoCard = ({ info }: InfoCardProps) => {
  const infoId = `info-${info.id}`;

  return (
    <article id={infoId} className="mb-16">
      <InfoCardHeader info={info} />

      <InfoCardContent info={info} />
    </article>
  );
};
