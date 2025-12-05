import { useRef } from 'react';

export function useScrollToElement() {
  const hashId = useRef('');
  if (window.location.hash) {
    hashId.current = location.hash.slice(1);
  }

  function removeHash() {
    if (hashId.current) {
      history.pushState(
        '',
        document.title,
        window.location.pathname + window.location.search,
      );
      hashId.current = '';
    }
  }

  function scrollIntoView(elementId: string) {
    const element = document.getElementById(elementId);

    if (element) {
      setTimeout(() => {
        document
          .getElementById(elementId)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  return {
    hash: hashId.current,
    removeHash,
    scrollIntoView,
  };
}
