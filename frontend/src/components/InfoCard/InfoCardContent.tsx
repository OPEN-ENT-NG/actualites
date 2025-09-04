import { InfoCardProps } from './InfoCard';

export const InfoCardContent = ({ info }: Pick<InfoCardProps, 'info'>) => {
  return <p>{info.content}</p>;
};
