import { useCallback, useEffect, useState } from 'react';
import { ExpandableContent, ExpandableProps } from '~/components/Expandable';

function render(content: ExpandableContent) {
  return typeof content == 'function' ? content() : content;
}

export const useExpandable = ({
  collapse,
  collapsedContent,
  expandedContent,
}: ExpandableProps) => {
  const [expanded, setExpanded] = useState(!collapse || !!collapsedContent);
  const [content, setContent] = useState(() =>
    render(collapse ? collapsedContent : expandedContent),
  );

  // When CSS transition ends
  const onTransitionEnd = useCallback(() => {
    // Determine which content to display.
    setContent(render(collapse ? collapsedContent : expandedContent));
    // Determine if content needs expansion.
    setExpanded(!collapse || !!collapsedContent);
  }, [collapse, collapsedContent]);

  // When `collapse` changes
  useEffect(() => {
    setExpanded((itWasExpanded) => {
      if (itWasExpanded) {
        // Close previously expanded content, and finish rendering in `onTransitionEnd`
        return false;
      } else {
        return !collapse || !!collapsedContent;
      }
    });
  }, [collapse]);

  return {
    onTransitionEnd,
    content,
    className: `expandable ${expanded ? 'expanded' : ''}`,
  };
};
