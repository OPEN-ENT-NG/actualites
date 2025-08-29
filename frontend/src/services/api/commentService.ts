import { odeServices } from '@edifice.io/client';
import { Comment, CommentId } from '~/models/comments';
import { baseUrl } from '.';
import { InfoId } from '../../models/info';

export const createCommentService = () => {
  return {
    /**
     * Get comments about an Info.
     * @returns an array of Comments objects
     */
    getComments(infoId: InfoId) {
      return odeServices
        .http()
        .get<Comment[]>(`${baseUrl}/infos/${infoId}/comments`);
    },

    /**
     * Create a new Comment.
     * @param payload
     * @returns ID of the newly created Info
     */
    create(payload: { info_id: InfoId; title: string; comment: string }) {
      return odeServices.http().put<{
        id: CommentId;
      }>(`${baseUrl}/info/${payload.info_id}/comment`, payload);
    },

    /**
     * Update a Comment.
     * @param commentId
     * @param payload
     */
    update(
      commentId: CommentId,
      payload: { info_id: InfoId; comment: string },
    ) {
      return odeServices.http().put<{
        rows: number;
      }>(`${baseUrl}/api/v1/infos/${payload.info_id}/comments/${commentId}`, payload);
    },

    /**
     * Delete a Comment.
     * @param infoId
     * @param commentId
     * @returns
     */
    delete(infoId: InfoId, commentId: CommentId) {
      return odeServices.http().delete<{
        rows: number;
      }>(`${baseUrl}/info/${infoId}/comment/${commentId}`);
    },
  };
};
