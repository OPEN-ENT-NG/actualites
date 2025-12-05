import {
  Avatar,
  ButtonSkeleton,
  Flex,
  Image,
  TextSkeleton,
} from '@edifice.io/react';
import { EditorPreviewSkeleton } from '@edifice.io/react/editor';
import React from 'react';

export const InfoModalSkeleton = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>((props, ref) => (
  <article
    ref={ref}
    {...props}
    className="card bg-gray-200 mb-16 px-24 py-16"
    data-testid="info-card-skeleton"
  >
    <header
      className="d-grid mb-12"
      style={{ gridTemplateColumns: '1fr 50% 1fr', gap: '12px' }}
    >
      <Flex align="center" gap="8">
        <Image width={32} height={32} src="" alt="" className="placeholder" />
        <TextSkeleton size="sm" className="col-3"></TextSkeleton>
      </Flex>
      <TextSkeleton size="lg" className="col-12"></TextSkeleton>
    </header>
    <Flex align="center" justify="center" gap="8">
      <Avatar alt="" size="xs" className="placeholder" />
      <TextSkeleton size="lg" className="col-2"></TextSkeleton>
    </Flex>
    <EditorPreviewSkeleton variant="ghost" />
    <Flex justify="end">
      <ButtonSkeleton size="sm" className="col-2" />
    </Flex>
  </article>
));
