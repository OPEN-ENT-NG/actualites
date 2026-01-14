import { matchPath } from 'react-router-dom';

/** Check for old format URLs and redirect if needed */
export const manageRedirections = (): string | null => {
  const hashLocation = window.location.hash.substring(1);
  if (hashLocation) {
    // Filter on thread ?
    const hasDefaultFilter = matchPath('/default?filter=:filter', hashLocation);
    if (hasDefaultFilter) {
      return `/threads/${hasDefaultFilter.params.filter}`;
    }

    // Remove unused hash ?
    const isDefault = matchPath('/default', hashLocation);
    if (isDefault) {
      // Suppress unused hash but do not reload the page.
      return `/threads`;
    }

    // Link to a comment ?
    const isPathWithComment = matchPath(
      '/view/info/:infoId/comment/:commentId',
      hashLocation,
    );
    if (isPathWithComment) {
      const { infoId, commentId } = isPathWithComment.params;
      return `/?info=${infoId}#comment-${commentId}`;
    }

    // Link to an info ?
    const isPathWithInfo = matchPath(
      '/view/thread/:threadId/info/:infoId',
      hashLocation,
    );
    if (isPathWithInfo) {
      const { threadId, infoId } = isPathWithInfo.params;
      return `/threads/${threadId}?info=${infoId}`;
    }

    // Link to an thread ?
    const isPathWithThread = matchPath('/view/thread/:id', hashLocation);
    if (isPathWithThread) {
      // Redirect to the new format
      return `/threads/${isPathWithThread.params.id}`;
    }
  }

  // No redirection needed
  return null;
};
