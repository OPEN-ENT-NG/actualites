import { ReactNode, TransitionEvent, useRef } from 'react';
import { useExpandable } from '~/hooks/useExpandable';
import './Expandable.css';

export type ExpandableContent = ReactNode | (() => ReactNode);

export type ExpandableProps = {
  collapse: boolean;
  expandedContent: ExpandableContent;
  collapsedContent?: ExpandableContent;
};

export const Expandable = (props: ExpandableProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { content, className, onTransitionEnd } = useExpandable(props);

  const handleTransitionEnd = (e: TransitionEvent) => {
    if (e.target === ref.current && e.propertyName === 'grid-template-rows') {
      onTransitionEnd();
    }
  };

  return (
    <div ref={ref} className={className} onTransitionEnd={handleTransitionEnd}>
      <div>{content}</div>
    </div>
  );
};
