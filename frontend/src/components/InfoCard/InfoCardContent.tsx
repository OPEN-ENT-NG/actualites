import { Editor, EditorPreview } from '@edifice.io/react/editor';
import { useRef } from 'react';
import { InfoCardProps } from './InfoCard';

export const InfoCardContent = ({
  info,
  collapse = true,
}: Pick<InfoCardProps, 'info'> & { collapse?: boolean }) => {
  const fullContentRef = useRef<HTMLDivElement>(null);
  const collapseContentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        transition: 'height 0.5s ease-in-out, opacity 0.5s ease-in-out',
      }}
    >
      <div
        ref={collapseContentRef}
        style={{
          height: collapse ? collapseContentRef.current?.scrollHeight : 0,
          opacity: collapse ? 1 : 0,
          overflow: 'hidden',
          transition: 'height 0.5s ease-in-out, opacity 0.5s ease-in-out',
        }}
      >
        <EditorPreview content={info.content} variant="ghost" />
      </div>
      <div
        ref={fullContentRef}
        style={{
          height: collapse ? 0 : fullContentRef.current?.scrollHeight,
          opacity: collapse ? 0 : 1,
          overflow: 'hidden',
          transition: 'height 0.5s ease-in-out, opacity 0.5s ease-in-out',
        }}
      >
        <Editor content={info.content} mode="read" variant="ghost" />
      </div>
    </div>
  );
};
