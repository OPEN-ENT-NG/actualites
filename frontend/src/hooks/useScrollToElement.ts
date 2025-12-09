import { InfoId } from '~/models/info';

export function useScrollToElement() {
  const hash = window.location.hash ? window.location.hash.slice(1) : '';

  const infoIdFromHash = hash.startsWith('info-')
    ? hash.endsWith('-comments')
      ? hash.slice(5, hash.length - 9)
      : hash.slice(5)
    : null;
  const infoId: InfoId | undefined =
    typeof infoIdFromHash == 'string' ? Number(infoIdFromHash) : undefined;

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
    infoId,
    removeHash,
    scrollIntoView,
  };
}
