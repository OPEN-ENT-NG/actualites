import { useEdificeClient } from '@edifice.io/react';
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { Comment, CommentId } from '~/models/comments';
import { InfoId } from '~/models/info';
import { queryClient } from '~/providers';
import { commentService } from '../api';

/**
 * Comment Query Keys always follow this format :
 * ['infos', infoId, 'comments', commentId]
 */
export const commentQueryKeys = {
  all: ({ infoId }: { infoId: InfoId }) => ['infos', infoId, 'comments'],

  comment: ({
    infoId,
    commentId,
  }: {
    infoId: InfoId;
    commentId: CommentId;
  }) => [...commentQueryKeys.all({ infoId }), commentId],
};

/**
 * Provides query options for comment-related operations.
 */
export const commentQueryOptions = {
  /**
   * @returns Query options for fetching comments about an info.
   */
  getComments(options: { infoId: InfoId }) {
    return queryOptions({
      queryKey: commentQueryKeys.all(options),
      queryFn: () => commentService.getComments(options.infoId),
    });
  },
};

export const useComments = (infoId: InfoId) =>
  useQuery(commentQueryOptions.getComments({ infoId }));

export const useCreateComment = () => {
  // TODO Inject queryClient instead of importing it ?
  const { user } = useEdificeClient();

  return useMutation({
    mutationFn: (payload: {
      title: string;
      comment: string;
      info_id: InfoId;
    }) => commentService.create(payload),
    // When mutate is called:
    onMutate: async ({ info_id, comment }) => {
      const queryKey = commentQueryKeys.all({ infoId: info_id });
      const now = new Date().toISOString();

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData<Comment[]>(queryKey);

      const newComment = {
        info_id,
        comment,
        _id: 0,
        owner: user?.userId ?? '',
        created: now,
        modified: now,
        username: user?.username ?? '',
      };
      // Optimistically update comments list
      queryClient.setQueryData<Comment[]>(queryKey, (old) =>
        [newComment].concat(old ?? []),
      );
      // Return a result with the snapshotted value
      return { previousComments, queryKey };
    },
    // If the mutation fails, use the result returned from onMutate to roll back.
    onError: (_err, { info_id }, onMutateResult) => {
      queryClient.setQueryData(
        commentQueryKeys.all({ infoId: info_id }),
        onMutateResult?.previousComments,
      );
    },
    // Always refetch after error or success.
    onSettled: (_data, _error, { info_id }) =>
      queryClient.invalidateQueries({
        queryKey: commentQueryKeys.all({ infoId: info_id }),
      }),
  });
};

export const useUpdateComment = () =>
  useMutation({
    mutationFn: ({
      commentId,
      payload,
    }: {
      commentId: CommentId;
      payload: {
        info_id: InfoId;
        comment: string;
      };
    }) => commentService.update(commentId, payload),
  });

export const useDeleteComment = () =>
  useMutation({
    mutationFn: ({
      commentId,
      infoId,
    }: {
      commentId: CommentId;
      infoId: InfoId;
    }) => commentService.delete(infoId, commentId),
  });
