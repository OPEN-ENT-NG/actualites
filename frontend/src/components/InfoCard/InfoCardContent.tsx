import { Editor, EditorPreview } from '@edifice.io/react/editor';
import { useState } from 'react';
import { CommentList } from '../comment-list/CommentList';
import { Expandable } from '../Expandable';
import { InfoCardProps } from './InfoCard';
import { InfoCardPreviousContent } from './InfoCardPreviousContent';

export const InfoCardContent = ({
  info,
  collapse = true,
  onCollapseApplied,
}: Pick<InfoCardProps, 'info'> & {
  collapse?: boolean;
  onCollapseApplied?: () => void;
}) => {
  const [showFullContent, setShowFullContent] = useState(!collapse);

  const handleTogglePreview = () => {
    setShowFullContent(!collapse);
  };

  return (
    <Expandable
      collapse={collapse}
      onCollapseApplied={onCollapseApplied}
      hasPreview
      onTogglePreview={handleTogglePreview}
    >
      <div
        id={`info-${info.id}-content`}
        className="info-card-content px-md-24"
      >
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
        {showFullContent && (
          <div id={`info-${info.id}-comments`}>
            <CommentList info={info} />
          </div>
        )}
      </div>
    </Expandable>
  );
};
