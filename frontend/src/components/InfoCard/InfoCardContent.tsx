import { Editor, EditorPreview } from '@edifice.io/react/editor';
import clsx from 'clsx';
import { useState } from 'react';
import { useInfoStatus } from '~/hooks/useInfoStatus';
import { CommentList } from '../comment-list/CommentList';
import { Expandable } from '../Expandable';
import { InfoCardProps } from './InfoCard';

export const InfoCardContent = ({
  info,
  withComments = true,
  forPrinting = false,
  collapse = true,
  onCollapseApplied,
}: Pick<InfoCardProps, 'info'> & {
  withComments?: boolean;
  forPrinting?: boolean;
  collapse?: boolean;
  onCollapseApplied?: () => void;
}) => {
  const [showFullContent, setShowFullContent] = useState(!collapse);
  const { canShowComments } = useInfoStatus(info);

  const handleTogglePreview = () => {
    setShowFullContent(!collapse);
  };

  const editorContent = showFullContent
    ? (info?.jsonContent ?? info?.content ?? '')
    : '';

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

        <div className={clsx({ 'd-none': !showFullContent })}>
          <Editor content={editorContent} mode="read" variant="ghost" />
        </div>

        {withComments && canShowComments && showFullContent && (
          <div id={`info-${info.id}-comments`}>
            <CommentList
              info={info}
              withPagination={false}
              forPrinting={forPrinting}
            />
          </div>
        )}
      </div>
    </Expandable>
  );
};
