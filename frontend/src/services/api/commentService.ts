import { odeServices } from '@edifice.io/client';
import { Comment, CommentId } from '~/models/comments';
import { baseUrlAPI } from '.';
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
        .get<Comment[]>(`${baseUrlAPI}/infos/${infoId}/comments`);
    },

    /**
     * Create a new Comment.
     * @param payload
     * @returns ID of the newly created Info
     */
    create(payload: { info_id: InfoId; title: string; comment: string }) {
      return odeServices.http().post<{
        id: CommentId;
      }>(`${baseUrlAPI}/infos/${payload.info_id}/comments`, payload);
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
      }>(`${baseUrlAPI}/infos/${payload.info_id}/comments/${commentId}`, payload);
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
      }>(`${baseUrlAPI}/infos/${infoId}/comments/${commentId}`);
    },
  };
};
