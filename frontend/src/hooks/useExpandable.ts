import { useCallback, useEffect, useState } from 'react';
import { ExpandableProps } from '~/components/Expandable';

export const useExpandable = ({
  collapse,
  onCollapseApplied,
  hasPreview,
  onTogglePreview,
}: Pick<
  ExpandableProps,
  'collapse' | 'onCollapseApplied' | 'hasPreview' | 'onTogglePreview'
>) => {
  const [expanded, setExpanded] = useState(!collapse || hasPreview);

  // When CSS transition ends
  const onTransitionEnd = useCallback(() => {
    // Expand content if needed.
    setExpanded((previous) => {
      const newValue = !collapse || hasPreview;
      if (previous !== newValue) {
        onTogglePreview?.();
      }
      if (newValue) {
        onCollapseApplied?.();
      }
      return newValue;
    });
  }, [collapse, onCollapseApplied, onTogglePreview]);

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
