import { odeServices } from '@edifice.io/client';
import { baseUrl } from '.';
import {
  Info,
  InfoId,
  InfoRevision,
  InfoStatus,
  OriginalInfo,
} from '../../models/info';
import { Share } from '../../models/share';
import { ThreadId } from '../../models/thread';

export const createInfoService = () => {
  return {
    /**
     * Get a page of Infos results.
     * @returns an array of Info objects
     */
    getInfos({
      page,
      pageSize,
      threadId,
    }: {
      page: number;
      pageSize: number;
      threadId?: ThreadId;
    }) {
      return odeServices.http().get<Info[]>(`${baseUrl}/list`, {
        queryParams: {
          page,
          pageSize,
          threadId,
        },
      });
    },

    /**
     * Create a new Info in DRAFT status.
     * @param payload
     * @returns ID of the newly created Info
     */
    createDraft(payload: {
      title: string;
      content: string;
      thread_id: ThreadId;
    }) {
      return odeServices.http().post<{
        id: InfoId;
      }>(`${baseUrl}/thread/${payload.thread_id}/info`, payload);
    },

    /**
     * Update an Info (its status cannot change).
     * @param threadId
     * @param infoId
     * @param infoStatus
     * @param payload
     * @returns ID of the updated Info
     */
    update(
      threadId: ThreadId,
      infoId: InfoId,
      infoStatus: InfoStatus,
      payload: {
        // thread_id: ThreadId; // FIXME Is uncommenting this line useful, or dangerous ?
        title: string;
        content: string;
        is_headline: boolean;
        publication_date?: string;
        expiration_date?: string;
      },
    ) {
      const action =
        infoStatus === InfoStatus.DRAFT
          ? 'draft'
          : infoStatus === InfoStatus.PENDING
            ? 'pending'
            : infoStatus === InfoStatus.PUBLISHED
              ? 'published'
              : null;
      if (!action) throw new Error('Cannot update a trashed Info');

      return odeServices.http().put<{
        id: InfoId;
      }>(`${baseUrl}/thread/${threadId}/info/${infoId}/${action}`, payload);
    },

    /**
     * Submit an Info.
     * @param threadId
     * @param infoId
     * @param payload for timeline notification
     * @returns ID of the updated Info
     */
    submit(
      threadId: ThreadId,
      infoId: InfoId,
      payload: {
        title: string;
      },
    ) {
      return odeServices.http().put<{
        id: InfoId;
      }>(`${baseUrl}/thread/${threadId}/info/${infoId}/submit`, payload);
    },

    /**
     * Unsubmit an Info.
     * @param threadId
     * @param infoId
     * @returns ID of the updated Info
     */
    unsubmit(threadId: ThreadId, infoId: InfoId) {
      return odeServices.http().put<{
        id: InfoId;
      }>(`${baseUrl}/thread/${threadId}/info/${infoId}/unsubmit`, {
        /*empty payload required*/
      });
    },

    /**
     * Publish an Info.
     * @param threadId
     * @param infoId
     * @param payload for timeline notification
     * @returns ID of the updated Info
     */
    publish(
      threadId: ThreadId,
      infoId: InfoId,
      payload: {
        title: string;
        owner: string; // ID of the owner, for timeline notification.
        username: string; // name of the owner, for timeline notification.
      },
    ) {
      return odeServices.http().put<{
        id: InfoId;
      }>(`${baseUrl}/thread/${threadId}/info/${infoId}/publish`, payload);
    },

    /**
     * Delete an Info.
     * @param threadId
     * @param infoId
     * @returns
     */
    delete(threadId: ThreadId, infoId: InfoId) {
      return odeServices.http().delete<{
        rows: number;
      }>(`${baseUrl}/thread/${threadId}/info/${infoId}`);
    },

    getShares(threadId: ThreadId, infoId: InfoId) {
      return odeServices
        .http()
        .get<Share>(`${baseUrl}/thread/${threadId}/info/share/json/${infoId}`);
    },

    getRevisions(infoId: InfoId) {
      return odeServices
        .http()
        .get<InfoRevision[]>(`${baseUrl}/info/${infoId}/timeline`);
    },

    getOriginalFormat(threadId: ThreadId, infoId: InfoId) {
      return odeServices
        .http()
        .get<OriginalInfo>(
          `${baseUrl}/thread/${threadId}/info/${infoId}?originalFormat=true`,
        );
    },
  };
};
