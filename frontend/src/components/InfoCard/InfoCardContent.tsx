import { Editor, EditorPreview } from '@edifice.io/react/editor';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { CommentList } from '../comment-list/CommentList';
import { InfoCardProps } from './InfoCard';
import { InfoCardPreviousContent } from './InfoCardPreviousContent';

export const InfoCardContent = ({
  info,
  collapse = true,
}: Pick<InfoCardProps, 'info'> & { collapse?: boolean }) => {
  const fullContentRef = useRef<HTMLDivElement>(null);
  const collapseContentRef = useRef<HTMLDivElement>(null);
  const [fullHeight, setFullHeight] = useState<number>(0);
  const [collapseHeight, setCollapseHeight] = useState<number>(0);

  // TODO : attendre le chargement des commentaires + render React avant de calculer la hauteur totale
  useEffect(() => {
    // Calculate heights full and collapsed for animation purposes
    if (
      fullContentRef.current &&
      fullContentRef.current.scrollHeight > fullHeight
    ) {
      setFullHeight(fullContentRef.current.scrollHeight);
    }
    if (
      collapseContentRef.current &&
      collapseContentRef.current.scrollHeight > collapseHeight
    ) {
      setCollapseHeight(collapseContentRef.current.scrollHeight);
    }
  }, [
    info.content,
    fullHeight,
    collapseHeight,
    fullContentRef.current?.scrollHeight,
    collapseContentRef.current?.scrollHeight,
  ]);

  const classNameContentCollapsed = clsx(
    'info-card-content px-md-24',
    !collapse ? 'content-hidden' : 'content-visible',
  );
  const classNameContentFull = clsx(
    'info-card-content px-md-24',
    collapse ? 'content-hidden' : 'content-visible',
  );

  return (
    <div>
      {/* Collapsed Content */}
      <div
        className={classNameContentCollapsed}
        ref={collapseContentRef}
        style={{
          height: collapse ? collapseHeight : 0,
        }}
      >
        <EditorPreview content={info.content} variant="ghost" />
      </div>

      {/* Full Content */}
      <div
        className={classNameContentFull}
        ref={fullContentRef}
        style={{
          height: collapse ? 0 : fullHeight,
        }}
      >
        {!collapse && info.content && <InfoCardPreviousContent info={info} />}
        <Editor content={info.content} mode="read" variant="ghost" />

        {!collapse && <CommentList info={info} />}
      </div>
    </div>
  );
};
