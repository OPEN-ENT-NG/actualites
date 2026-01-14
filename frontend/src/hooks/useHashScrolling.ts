const MAX_SCROLL_RETRIES = 20;
const SCROLL_RETRY_DELAY_MS = 150;

/**
 * Custom React hook for handling scroll-to-element functionality based on URL hash.
 *
 * The application may generate one of the following hash:
 * - `#info-:infoId` - Direct reference to an info element
 * - `#info-:infoId-comments` - Reference to an info element's comments section
 * - `#comment-:commentId` - Direct reference to a comment element
 * but any hash should be supported.
 *
 * @returns An object containing:
 * - `hash` - The current URL hash without the '#' prefix
 * - `removeHash` - Function to remove the hash from the URL without page reload
 * - `deferScrollIntoView` - Function to scroll to an element by ID with retry logic
 * ```
 */
export function useHashScrolling() {
  const hash = window.location.hash.substring(1);

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
    removeHash,
    deferScrollIntoView,
  };
}
