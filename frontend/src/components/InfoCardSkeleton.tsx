import { Avatar, ButtonSkeleton, Image, TextSkeleton } from '@edifice.io/react';
import { EditorPreviewSkeleton } from '@edifice.io/react/editor';
import React from 'react';

export const InfoCardSkeleton = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>((props, ref) => (
  <article ref={ref} {...props} className="card bg-gray-200 mb-16 px-24 py-16">
    <header
      className="d-grid mb-12"
      style={{ gridTemplateColumns: '1fr 50% 1fr', gap: '12px' }}
    >
      <div className="d-flex align-items-center gap-8">
        <Image width={32} height={32} src="" alt="" className="placeholder" />
        <TextSkeleton size="sm" className="col-3"></TextSkeleton>
      </div>
      <TextSkeleton size="lg" className="col-12"></TextSkeleton>
    </header>
    <div className="d-flex align-items-center justify-content-center gap-8">
      <Avatar alt="" size="xs" className="placeholder" />
      <TextSkeleton size="lg" className="col-2"></TextSkeleton>
    </div>
    <EditorPreviewSkeleton variant="ghost" />
    <div className="d-flex justify-content-end">
      <ButtonSkeleton size="sm" className="col-2" />
    </div>
  </article>
));
