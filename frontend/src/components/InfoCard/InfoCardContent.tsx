import { EditorPreview } from '@edifice.io/react/editor';
import { InfoCardProps } from './InfoCard';

export const InfoCardContent = ({ info }: Pick<InfoCardProps, 'info'>) => {
  return <EditorPreview content={info.content} variant="ghost" />;
};
