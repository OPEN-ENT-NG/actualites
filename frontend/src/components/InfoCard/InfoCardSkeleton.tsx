import React from 'react';

export const InfoCardSkeleton = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>((props, ref) => (
  <article ref={ref} {...props} className="mb-16">
    <header>
      <h1 className="placeholder-glow">
        <span className="placeholder col-6"></span>
      </h1>
    </header>
  </article>
));
