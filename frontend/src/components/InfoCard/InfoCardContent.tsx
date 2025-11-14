import { Editor, EditorPreview } from '@edifice.io/react/editor';
import { useRef } from 'react';
import { CommentList } from '../comment-list/CommentList';
import { Expandable } from '../Expandable';
import { InfoCardProps } from './InfoCard';
import { InfoCardPreviousContent } from './InfoCardPreviousContent';

export const InfoCardContent = ({
  info,
  collapse = true,
}: Pick<InfoCardProps, 'info'> & { collapse?: boolean }) => {
  const fullContentRef = useRef<HTMLDivElement>(null);
  const collapseContentRef = useRef<HTMLDivElement>(null);

  return (
    <Expandable expanded={!collapse}>
      {collapse ? (
        /* Collapsed Content */
        <div className="info-card-content px-md-24" ref={collapseContentRef}>
          <EditorPreview content={info.content} variant="ghost" />
        </div>
      ) : (
        /* Full Content */
        <div className="info-card-content px-md-24" ref={fullContentRef}>
          {info.content && <InfoCardPreviousContent info={info} />}
          <Editor content={info.content} mode="read" variant="ghost" />

          <CommentList info={info} />
        </div>
      )}
    </Expandable>
  );
};
