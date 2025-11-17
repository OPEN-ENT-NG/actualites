import { Editor, EditorPreview } from '@edifice.io/react/editor';
import { useState } from 'react';
import { CommentList } from '../comment-list/CommentList';
import { Expandable } from '../Expandable';
import { InfoCardProps } from './InfoCard';
import { InfoCardPreviousContent } from './InfoCardPreviousContent';

export const InfoCardContent = ({
  info,
  collapse = true,
}: Pick<InfoCardProps, 'info'> & { collapse?: boolean }) => {
  const [showFullContent, setShowFullContent] = useState(!collapse);

  const handleToggle = () => {
    setShowFullContent(!collapse);
  };

  return (
    <Expandable collapse={collapse} hasPreview onToggle={handleToggle}>
      <div className="info-card-content px-md-24">
        {!showFullContent && (
          <EditorPreview content={info.content} variant="ghost" />
        )}

        {showFullContent && info.content && (
          <InfoCardPreviousContent info={info} />
        )}
        <Editor
          content={showFullContent ? info.content : ''}
          mode="read"
          variant="ghost"
        />
        {showFullContent && <CommentList info={info} />}
      </div>
    </Expandable>
  );
};
