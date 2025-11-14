import { ReactNode } from 'react';
import { useExpand } from '~/hooks/useExpand';
import './Expandable.css';

export const Expandable = ({
  children,
  expanded = false,
}: {
  children: ReactNode;
  expanded?: boolean;
}) => {
  const { onToggled, visible, ...content } = useExpand(expanded);

  return (
    <div
      className={`expandable-content ${content.expanded ? 'expanded' : ''}`}
      onTransitionEnd={onToggled}
    >
      <div>{visible && children}</div>
    </div>
  );
};
