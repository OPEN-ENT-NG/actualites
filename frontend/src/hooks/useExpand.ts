import { useCallback, useState } from 'react';

export const useExpand = (defaultExpanded: boolean) => {
  const [visible, setVisible] = useState(defaultExpanded);
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = useCallback(() => {
    if (expanded) {
      setExpanded(false);
    } else {
      setVisible(true);
      setExpanded(true);
    }
  }, [visible, expanded]);

  const onToggled = useCallback(() => {
    if (visible && !expanded) {
      setVisible(false);
    }
  }, [expanded, visible]);

  return { toggle, expanded, visible, onToggled };
};
