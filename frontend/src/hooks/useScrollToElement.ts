import { useThreadInfoParams } from './useThreadInfoParams';

const MAX_SCROLL_RETRIES = 20;
const SCROLL_RETRY_DELAY_MS = 150;

/**
 * Custom React hook for handling scroll-to-element functionality based on URL hash.
 *
 * @remarks
 * This hook parses the URL hash to extract element identifiers (either info or comment IDs)
 * and provides utilities to scroll to these elements and manage the URL hash.
 *
 * The hash format can be:
 * - `#info-:infoId` - Direct reference to an info element
 * - `#info-:infoId-comments` - Reference to an info element's comments section
 * - `#comment-:commentId` - Direct reference to a comment element
 *
 * @returns An object containing:
 * - `hash` - The current URL hash without the '#' prefix
 * - `infoId` - The extracted info ID from either the hash or path parameters
 * - `removeHash` - Function to remove the hash from the URL without page reload
 * - `deferScrollIntoView` - Function to scroll to an element by ID with retry logic
 * ```
 */
export function useScrollToElement() {
  // Hash can be either #info-:infoId or #comment-:commentId
  const hash = window.location.hash ? window.location.hash.slice(1) : '';

  const { infoId: infoIdFromPathParam, stringToId } = useThreadInfoParams();
  const infoIdFromHash = hash.startsWith('info-')
    ? hash.endsWith('-comments')
      ? hash.slice(5, hash.length - 9)
      : hash.slice(5)
    : undefined;

  const infoId = stringToId(infoIdFromHash) ?? infoIdFromPathParam;

  function removeHash() {
    history.pushState(
      '',
      document.title,
      window.location.pathname + window.location.search,
    );
  }

  function deferScrollIntoView(elementId: string) {
    function scrollToElement(count: number) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (count < MAX_SCROLL_RETRIES) {
        setTimeout(() => scrollToElement(count + 1), SCROLL_RETRY_DELAY_MS);
      }
    }
    setTimeout(() => scrollToElement(0), SCROLL_RETRY_DELAY_MS);
  }

  return {
    hash,
    infoId,
    removeHash,
    deferScrollIntoView,
  };
}
