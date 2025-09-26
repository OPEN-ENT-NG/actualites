import { useParams } from 'react-router-dom';

/** Hook to extract ID of the Thread and/or Info from query parameters. */
export function useThreadInfoParams() {
  const { infoIdAsString, threadIdAsString } = useParams();

  function stringToId(idAsString?: string) {
    const id = idAsString ? Number.parseInt(idAsString) : NaN;
    return isNaN(id) ? -1 : id;
  }

  return {
    infoId: stringToId(infoIdAsString),
    threadId: stringToId(threadIdAsString),
    stringToId,
  };
}
