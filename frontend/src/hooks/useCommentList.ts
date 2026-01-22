import { RightRole } from '@edifice.io/client';
import { CommentProps } from 'node_modules/@edifice.io/react/dist/modules/comments/types';
import { useMemo } from 'react';
import { Info } from '~/models/info';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from '~/services/queries';
import { useInfoStatus } from './useInfoStatus';
import { useInfoUserRights } from './useInfoUserRights';
import { useThreadUserRights } from './useThreadUserRights';

// Local interface definition
declare interface CommentOptions {
  maxCommentLength: number;
  maxReplyLength: number;
  maxComments: number;
  additionalComments: number;
  maxReplies: number;
  additionalReplies: number;
  allowReplies: boolean;
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
 *   - allowReplies: Falsy when user cannot reply to comments
 * - comments: Array of comments
 */
export function useCommentList(info: Info) {
  const {
    canContributeInThread,
    canManageThread,
    canPublishInThread,
    isThreadOwner,
  } = useThreadUserRights(info.threadId);
  const { isCreator, canComment } = useInfoUserRights(info);
  const { isExpired } = useInfoStatus(info);
  const { data } = useComments(info.id);
  const comments = useMemo(
    () =>
      (
        data?.map((comment) => {
          let adaptedComment: CommentProps = {
            id: '' + comment._id,
            comment: comment.comment,
            authorId: comment.owner,
            authorName: comment.username,
            createdAt: Date.parse(comment.created),
          };
          // Set update date only when it is different from the creation date.
          if (comment.created !== comment.modified) {
            adaptedComment.updatedAt = Date.parse(comment.modified);
          }
          return adaptedComment;
        }) ?? []
      ).sort((a, b) => a.createdAt - b.createdAt),
    [data],
  );

  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  const canManageComments =
    canManageThread || canPublishInThread || isThreadOwner;
  /*
  CommentProvider must be in edit mode if :
  - the user has been granted the right to comment AND this info is not expired,
  OR
  - the user has management rights on this info.
  */
  const type: 'read' | 'edit' =
    (canComment && !isExpired) || canManageComments ? 'edit' : 'read';
  const callbacks = {
    post: async (comment: string) => {
      createCommentMutation.mutate({
        payload: {
          info_id: info.id,
          comment,
        },
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
        threadId: info.threadId,
      });
    },
  };

  const rights: Record<RightRole, boolean> = {
    read: true,
    contrib: canContributeInThread, // seems useless
    manager: canManageComments,
    creator: isCreator,
  };

  const options = {
    maxCommentLength: 800,
    additionalComments: 10,
    maxComments: 2,
    allowReplies: false,
  } as Partial<CommentOptions>;

  return {
    type,
    callbacks,
    rights,
    options,
    comments,
  };
}
