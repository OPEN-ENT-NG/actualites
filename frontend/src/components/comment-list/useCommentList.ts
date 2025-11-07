import { useReducer } from 'react';
import { Comment } from '~/models/comments';
import { Info } from '~/models/info';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from '~/services/queries';

// Add local interface definition
declare interface CommentProps {
  id: string;
  comment: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt: number;
}

// Reducer to mimic pagination
function reducer(
  state: { nbVisible: any; comments: CommentProps[] },
  action: { type: string },
) {
  switch (action.type) {
    case 'more': {
      let { nbVisible, comments } = state;
      nbVisible = Math.min(nbVisible + 10, comments.length);
      return { ...state, nbVisible, hasMore: nbVisible >= comments.length };
    }
  }
  throw Error('Unknown action: ' + action.type);
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
 * - hasMore: Boolean indicating if more comments can be loaded
 * - comments: Array of currently visible comments
 * - viewMore: Function to load additional comments
 */
export function useCommentList(info: Info) {
  const type: 'read' | 'edit' = 'edit'; // TODO: adapt value depending on user's right.

  const { data } = useComments(info.id);
  const [state, dispatch] = useReducer(
    reducer,
    data,
    (initialData: Comment[] | undefined) => {
      // Init fonction
      const comments =
        initialData?.map((comment) => ({
          id: '' + comment._id,
          comment: comment.comment,
          authorId: comment.owner,
          authorName: comment.username,
          createdAt: comment.created as unknown as number,
          updatedAt: comment.modified as unknown as number,
        })) ?? [];
      const nbVisible = Math.min(2, comments.length);
      return { comments, nbVisible, hasMore: nbVisible >= comments.length };
    },
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
    additionalReplies: 0,
    maxCommentLength: 800,
    maxComments: 5,
    maxReplies: 0,
    maxReplyLength: 0,
  };

  return {
    type,
    callbacks,
    options,
    hasMore: state.nbVisible < state.comments.length,
    comments: state.comments.slice(0, state.nbVisible),
    viewMore() {
      dispatch({ type: 'more' });
    },
  };
}
