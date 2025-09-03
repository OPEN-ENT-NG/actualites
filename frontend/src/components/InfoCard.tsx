import { useDate } from '@edifice.io/react';
import { Info } from '~/models/info';
import { SeparatedInfo } from './SeparatedInfo';

export type InfoCardProps = {
  info: Info;
};

export const InfoCard = ({ info }: InfoCardProps) => {
  const { formatDate } = useDate();

  return (
    <article className="mb-16">
      <header>
        <h1>{info.title}</h1>
        <SeparatedInfo>
          <div>{info.owner.displayName}</div>
          <div>{formatDate(info.modified, 'long')}</div>
        </SeparatedInfo>
      </header>
      <section>
        <p>{info.content}</p>
      </section>
    </article>
  );
};
