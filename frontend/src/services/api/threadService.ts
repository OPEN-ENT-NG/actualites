import { odeServices } from '@edifice.io/client';
import { Thread, ThreadId, ThreadMode, ThreadShares } from '~/models/thread';
import { baseUrl } from '.';

export const createThreadService = () => {
  return {
    /**
     * Search for user/group/bookmark.
     * @param search search string
     * @returns a list of Visible objects
     */
    getThreads() {
      return odeServices.http().get<Thread[]>(`${baseUrl}/threads`);
    },
    create(payload: { mode: ThreadMode; title: string }) {
      return odeServices.http().post<{
        id: ThreadId;
      }>(`${baseUrl}/thread`, payload);
    },
    update(threadId: ThreadId, payload: { mode: ThreadMode; title: string }) {
      return odeServices
        .http()
        .put<void>(`${baseUrl}/thread/${threadId}`, payload);
    },
    delete(threadId: ThreadId) {
      return odeServices.http().delete<void>(`${baseUrl}/thread/${threadId}`);
    },
    getShare(threadId: ThreadId) {
      return odeServices
        .http()
        .get<ThreadShares>(`${baseUrl}/thread/share/json/${threadId}`);
    },
  };
};
