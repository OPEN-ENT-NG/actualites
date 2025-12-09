export function useScrollToElement() {
  const hash = window.location.hash ? window.location.hash.slice(1) : '';

  function removeHash() {
    history.pushState(
      '',
      document.title,
      window.location.pathname + window.location.search,
    );
  }

  function scrollIntoView(elementId: string) {
    const element = document.getElementById(elementId);

    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  return {
    hash,
    removeHash,
    scrollIntoView,
  };
}
