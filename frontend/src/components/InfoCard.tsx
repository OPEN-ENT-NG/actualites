import { Info } from '~/models/info';

export type InfoCardProps = {
  info: Info;
};

export const InfoCard = ({ info }: InfoCardProps) => {
  return (
    <article className="mb-16">
      <header>
        <h1>{info.title}</h1>
        <div>créé le : {info.created}</div>
      </header>
      <section>
        <p>{info.content}</p>
      </section>
    </article>
  );
};
