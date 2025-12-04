import { odeServices } from '@edifice.io/client';
import { baseUrlAPI } from '.';
import { Share } from '../../models/share';
import { Thread, ThreadId, ThreadMode } from '../../models/thread';

/**
 * Creates a thread service that provides methods for managing threads.
 *
 * @returns An object containing methods to:
 * - Get all threads
 * - Create a new thread with mode and title
 * - Update an existing thread's mode and title
 * - Delete a thread by ID
 * - Get sharing information for a thread
 */
export const createThreadService = () => {
  return {
    /**
     * Get all threads.
     * @returns an array of Thread objects
     */
    getThreads() {
      return odeServices.http().get<Thread[]>(`${baseUrlAPI}/threads`);
    },

    /**
     * Create a new thread.
     * @param payload - The data for the new thread.
     * @returns The created thread's ID.
     */
    create(payload: { mode: ThreadMode; title: string }) {
      return odeServices.http().post<{
        id: ThreadId;
      }>(`${baseUrlAPI}/threads`, payload);
    },
    /**
     * Update an existing thread.
     * @param threadId - The ID of the thread to update.
     * @param payload - The updated data for the thread.
     * @returns A promise that resolves when the thread is updated.
     */
    update(threadId: ThreadId, payload: { mode: ThreadMode; title: string }) {
      return odeServices
        .http()
        .put<void>(`${baseUrlAPI}/threads/${threadId}`, payload);
    },
    /**
     * Delete a thread.
     * @param threadId - The ID of the thread to delete.
     * @returns A promise that resolves when the thread is deleted.
     */
    delete(threadId: ThreadId) {
      return odeServices
        .http()
        .delete<void>(`${baseUrlAPI}/threads/${threadId}`);
    },
    /**
     * Get sharing information for a thread.
     * @param threadId - The ID of the thread to get sharing information for.
     * @returns A promise that resolves with the sharing information for the thread.
     */
    getShares(threadId: ThreadId) {
      return odeServices
        .http()
        .get<Share>(`${baseUrlAPI}/threads/${threadId}/shares`);
    },
  };
};
