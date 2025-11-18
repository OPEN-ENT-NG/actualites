import { useMemo } from 'react';
import { Info } from '~/models/info';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from '~/services/queries';

// Local interface definition
declare interface CommentOptions {
  maxCommentLength: number;
  maxReplyLength: number;
  maxComments: number;
  additionalComments: number;
  maxReplies: number;
  additionalReplies: number;
  disableReply: boolean;
}

/**
 * Custom hook to manage a list of comments with pagination and editing capabilities.
 *
 * @param info - Information object required to fetch comments
 * @returns An object containing:
 * - type: Access mode ('read' or 'edit')
 * - callbacks: Object containing async functions for comment operations
 *   - delete: Function to delete a comment
 *   - post: Function to create a new comment
 *   - put: Function to update an existing comment
 * - options: Configuration object with limits and constraints
 *   - additionalComments: Number of comments to load when viewing more
 *   - additionalReplies: Number of replies to load when expanding
 *   - maxCommentLength: Maximum length for comments
 *   - maxComments: Maximum number of comments allowed
 *   - maxReplies: Maximum number of replies allowed
 *   - maxReplyLength: Maximum length for replies
 *   - disableReplies: Truthy when user cannot reply to comments
 * - comments: Array of comments
 */
export function useCommentList(info: Info) {
  const type: 'read' | 'edit' = 'edit'; // TODO: adapt value depending on user's right.

  const { data } = useComments(info.id);
  const comments = useMemo(
    () =>
      (
        data?.map((comment) => ({
          id: '' + comment._id,
          comment: comment.comment,
          authorId: comment.owner,
          authorName: comment.username,
          createdAt: Date.parse(comment.created),
          updatedAt: Date.parse(comment.modified),
        })) ?? []
      ).sort((a, b) => a.createdAt - b.createdAt),
    [data],
  );

  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  const callbacks = {
    post: async (comment: string) => {
      createCommentMutation.mutate({
        info_id: info.id,
        title: info.title,
        comment,
      });
    },
    put: async ({
      comment,
      commentId,
    }: {
      comment: string;
      commentId: string;
    }) => {
      updateCommentMutation.mutate({
        commentId: Number(commentId),
        payload: {
          info_id: info.id,
          comment,
        },
      });
    },
    delete: async (commentId: string) => {
      deleteCommentMutation.mutate({
        commentId: Number(commentId),
        infoId: info.id,
      });
    },
  };

  const options = {
    additionalComments: 10,
    maxComments: 2,
    disableReply: true,
  } as Partial<CommentOptions>;

  return {
    type,
    callbacks,
    options,
    comments,
  };
}
