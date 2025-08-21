import { odeServices } from '@edifice.io/client';
import { Thread } from '~/models/thread';

export const createThreadService = () => {
  return {
    /**
     * Search for user/group/bookmark.
     * @param search search string
     * @returns a list of Visible objects
     */
    getThreads() {
      return odeServices.http().get<Thread[]>(`/actualites/threads`);
    },
  };
};
