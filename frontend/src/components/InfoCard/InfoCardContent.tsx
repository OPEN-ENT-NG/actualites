import { InfoCardProps } from './InfoCard';

export const InfoCardContent = ({ info }: InfoCardProps) => {
  return <p>{info.content}</p>;
};
