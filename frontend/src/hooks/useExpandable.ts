import { useCallback, useEffect, useState } from 'react';
import { ExpandableProps } from '~/components/Expandable';

export const useExpandable = ({
  collapse,
  hasPreview,
  onToggle,
}: Pick<ExpandableProps, 'collapse' | 'hasPreview' | 'onToggle'>) => {
  const [expanded, setExpanded] = useState(!collapse || hasPreview);

  // When CSS transition ends
  const onTransitionEnd = useCallback(() => {
    // Expand content if needed.
    setExpanded((previous) => {
      const newValue = !collapse || hasPreview;
      if (previous !== newValue) {
        onToggle();
      }
      return newValue;
    });
  }, [collapse, hasPreview]);

  // When `collapse` changes
  useEffect(() => {
    setExpanded((itWasExpanded) => {
      if (itWasExpanded) {
        // Close previously expanded content, and finish rendering in `onTransitionEnd`
        return false;
      } else {
        return !collapse || hasPreview;
      }
    });
  }, [collapse]);

  return {
    onTransitionEnd,
    className: `expandable ${expanded ? 'expanded' : ''}`,
  };
};
