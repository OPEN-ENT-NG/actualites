import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { CommentId } from '~/models/comments';
import { InfoId } from '~/models/info';
import { ThreadId } from '~/models/thread';
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
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },
};

export const useComments = (infoId: InfoId) =>
  useQuery(commentQueryOptions.getComments({ infoId }));

export const useCreateComment = () =>
  useMutation({
    mutationFn: (payload: {
      title: string;
      comment: string;
      info_id: number;
    }) => commentService.create(payload),
  });

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
      commentId: ThreadId;
      infoId: InfoId;
    }) => commentService.delete(infoId, commentId),
  });
