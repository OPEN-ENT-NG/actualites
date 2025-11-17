import { Editor, EditorPreview } from '@edifice.io/react/editor';
import { useCallback } from 'react';
import { CommentList } from '../comment-list/CommentList';
import { Expandable } from '../Expandable';
import { InfoCardProps } from './InfoCard';
import { InfoCardPreviousContent } from './InfoCardPreviousContent';

export const InfoCardContent = ({
  info,
  collapse = true,
}: Pick<InfoCardProps, 'info'> & { collapse?: boolean }) => {
  // Function rendering a collapsed content.
  const renderCollapsed = useCallback(
    () => (
      <div className="info-card-content px-md-24">
        <EditorPreview content={info.content} variant="ghost" />
      </div>
    ),
    [collapse, info.content],
  );

  // Function rendering an expanded content.
  const renderExpanded = useCallback(
    () => (
      <div className="info-card-content px-md-24">
        {info.content && <InfoCardPreviousContent info={info} />}
        <Editor content={info.content} mode="read" variant="ghost" />
        <CommentList info={info} />
      </div>
    ),
    [collapse, info.content],
  );

  return (
    <Expandable
      collapse={collapse}
      collapsedContent={renderCollapsed}
      expandedContent={renderExpanded}
    />
  );
};
