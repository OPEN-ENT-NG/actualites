import { Editor, EditorPreview } from '@edifice.io/react/editor';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { InfoCardProps } from './InfoCard';

export const InfoCardContent = ({
  info,
  collapse = true,
}: Pick<InfoCardProps, 'info'> & { collapse?: boolean }) => {
  const fullContentRef = useRef<HTMLDivElement>(null);
  const collapseContentRef = useRef<HTMLDivElement>(null);
  const [fullHeight, setFullHeight] = useState<number>(0);
  const [collapseHeight, setCollapseHeight] = useState<number>(0);

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
    'info-card-content',
    !collapse ? 'content-hidden' : 'content-visible',
  );
  const classNameContentFull = clsx(
    'info-card-content',
    collapse ? 'content-hidden' : 'content-visible',
  );

  return (
    <div>
      <div
        className={classNameContentCollapsed}
        ref={collapseContentRef}
        style={{
          height: collapse ? collapseHeight : 0,
        }}
      >
        <EditorPreview content={info.content} variant="ghost" />
      </div>
      <div
        className={classNameContentFull}
        ref={fullContentRef}
        style={{
          height: collapse ? 0 : fullHeight,
        }}
      >
        <Editor content={info.content} mode="read" variant="ghost" />
      </div>
    </div>
  );
};
