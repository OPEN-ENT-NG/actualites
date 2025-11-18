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
    // Expand if needed.
    setExpanded((isExpanded) => {
      const shouldBeExpanded = !collapse || hasPreview;
      // Check if expanding is needed to show the full content or the preview.
      if (isExpanded !== shouldBeExpanded) {
        // If yes, allow the Expandable component to toggle between preview or full content children before expanding
        onTogglePreview?.();
      }
      if (shouldBeExpanded) {
        // Inform the Expandable component that the collapse property change has been applied.
        onCollapseApplied?.();
      }
      return shouldBeExpanded;
    });
  }, [collapse, onCollapseApplied, onTogglePreview]);

  // When `collapse` changes
  useEffect(() => {
    setExpanded((isExpanded) => {
      if (isExpanded) {
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
