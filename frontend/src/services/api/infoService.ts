import { odeServices, ShareRight } from '@edifice.io/client';
import { baseUrl, baseUrlAPI } from '.';
import {
  Info,
  InfoDetails,
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
     * Get an Info by its ID.
     * @param param0 - The ID of the Info to retrieve.
     * @returns The requested Info object.
     */
    getInfo({ infoId }: { infoId: InfoId }) {
      return odeServices
        .http()
        .get<InfoDetails>(`${baseUrlAPI}/infos/${infoId}`);
    },
    /**
     * Get a page of Infos results.
     * @param param0 - The page number, page size, and optional thread ID to filter Infos.
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
      const queryParams: {
        page: number;
        pageSize: number;
        threadIds?: number;
      } = {
        page,
        pageSize,
      };

      if (threadId) {
        queryParams.threadIds = Number(threadId);
      }

      return odeServices.http().get<Info[]>(`${baseUrlAPI}/infos`, {
        queryParams,
      });
    },

    /**
     * Create a new Info in DRAFT status.
     * @param payload
     * @returns ID of the newly created Info
     */
    createDraft(payload: {
      title?: string;
      content?: string;
      thread_id?: ThreadId;
    }) {
      return odeServices.http().post<{
        id: InfoId;
      }>(`${baseUrlAPI}/infos`, {
        title: payload.title,
        content: payload.content,
        status: 1, // DRAFT
        thread_id: Number(payload.thread_id),
      });
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
      infoId: InfoId,
      infoStatus: InfoStatus,
      payload: {
        thread_id?: ThreadId; // FIXME Is uncommenting this line useful, or dangerous ?
        title?: string;
        content?: string;
        is_headline: boolean;
        publication_date?: string;
        expiration_date?: string;
      },
    ) {
      const status =
        infoStatus === InfoStatus.DRAFT
          ? 1
          : infoStatus === InfoStatus.PENDING
            ? 2
            : infoStatus === InfoStatus.PUBLISHED
              ? 3
              : null;
      if (!status) throw new Error('Cannot update a trashed Info');

      return odeServices.http().put<{
        id: InfoId;
      }>(`${baseUrlAPI}/infos/${infoId}`, { ...payload, status });
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

    getShares(infoId: InfoId) {
      return odeServices
        .http()
        .get<Share>(`${baseUrlAPI}/infos/${infoId}/shares`);
    },

    async putShares(infoId: InfoId, rights: ShareRight[]) {
      const payload = await odeServices
        .share()
        .getPutSharePayload('actualites', rights);
      return odeServices
        .http()
        .put<Share>(`${baseUrlAPI}/infos/${infoId}/shares`, payload);
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
