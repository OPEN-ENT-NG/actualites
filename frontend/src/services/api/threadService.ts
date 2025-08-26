import { odeServices } from '@edifice.io/client';
import { baseUrl } from '.';
import { Share } from '../../models/share';
import { Thread, ThreadId, ThreadMode } from '../../models/thread';

export const createThreadService = () => {
  return {
    /**
     * Get all threads.
     * @returns an array of Thread objects
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
    getShares(threadId: ThreadId) {
      return odeServices
        .http()
        .get<Share>(`${baseUrl}/thread/share/json/${threadId}`);
    },
  };
};
