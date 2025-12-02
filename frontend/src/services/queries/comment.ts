import { useEdificeClient, useToast } from '@edifice.io/react';
import {
  InfiniteData,
  queryOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { useI18n } from '~/hooks/useI18n';
import { useThreadInfoParams } from '~/hooks/useThreadInfoParams';
import { Comment, CommentId } from '~/models/comments';
import { Info, InfoId } from '~/models/info';
import { ThreadId } from '~/models/thread';
import { queryClient } from '~/providers';
import { commentService } from '../api';
import { infoQueryKeys } from './info';

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
  const { t } = useI18n();
  const toast = useToast();

  // For optimistic update to work, we need to search which info to update
  // among all threads (or only 1 thread, depending on the route parameters),
  // and change its comments counter.
  const { threadId } = useThreadInfoParams();

  return useMutation({
    mutationFn: ({
      payload,
    }: {
      payload: {
        comment: string;
        info_id: InfoId;
      };
    }) => commentService.create(payload),
    onMutate: async ({ payload }) => {
      const { info_id, comment } = payload;
      const queryKey = commentQueryKeys.all({ infoId: info_id });

      const infosQueryKey = infoQueryKeys.all({ threadId });

      const now = new Date().toISOString();

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData<Comment[]>(queryKey);

      const newComment: Comment = {
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
      // Optimistically update comments counter
      const infiniteInfos =
        queryClient.getQueryData<InfiniteData<Info[]>>(infosQueryKey);
      const pages = infiniteInfos?.pages;
      const pageParams = infiniteInfos?.pageParams;
      const info = pages?.flat().find((info) => info.id === info_id);
      if (pages && pageParams && info) {
        info.numberOfComments =
          typeof info.numberOfComments === 'number'
            ? info.numberOfComments + 1
            : 1;
        queryClient.setQueryData<InfiniteData<Info[]>>(infosQueryKey, () => {
          return { pages: [...pages], pageParams: pageParams };
        });
      }
      // Return a result with the snapshotted value
      return { previousComments, queryKey };
    },
    onSuccess: () => {
      toast.success(t('actualites.comment.created'));
    },
    // If the mutation fails, use the result returned from onMutate to roll back.
    onError: (_err, _variables, onMutateResult) => {
      toast.success(t('actualites.comment.error'));
      if (onMutateResult) {
        queryClient.setQueryData(
          onMutateResult.queryKey,
          onMutateResult.previousComments,
        );
      }
    },
    // Always refetch after error or success.
    onSettled: (_data, _error, { payload }) =>
      queryClient.invalidateQueries({
        queryKey: commentQueryKeys.all({ infoId: payload.info_id }),
      }),
  });
};

export const useUpdateComment = () => {
  const { t } = useI18n();
  const toast = useToast();

  return useMutation({
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
    onMutate: async ({ commentId, payload }) => {
      const { info_id, comment } = payload;
      const queryKey = commentQueryKeys.all({ infoId: info_id });

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const comments = queryClient.getQueryData<Comment[]>(queryKey);

      // Optimistically update comment
      const updatedComment = comments?.find(
        (comment) => comment._id === commentId,
      );
      if (comments && updatedComment) {
        updatedComment.comment = comment;
        queryClient.setQueryData<Comment[]>(queryKey, () => [...comments]);
      }
      // Return a result with the snapshotted value
      return { comments, queryKey };
    },
    onSuccess: () => toast.success(t('actualites.comment.updated')),
    onError: () => toast.error(t('actualites.comment.error')),
    // Always refetch after error or success.
    onSettled: (_data, _error, { payload }) =>
      queryClient.invalidateQueries({
        queryKey: commentQueryKeys.all({ infoId: payload.info_id }),
      }),
  });
};

export const useDeleteComment = () => {
  // For optimistic update to work, we need to search which info to update
  // among all threads (or only 1 thread, depending on the route parameters),
  // and change its comments counter.
  const { threadId } = useThreadInfoParams();
  const { t } = useI18n();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      commentId,
      infoId,
    }: {
      commentId: CommentId;
      infoId: InfoId;
      threadId: ThreadId;
    }) => commentService.delete(infoId, commentId),
    onMutate: async ({ commentId, infoId }) => {
      const queryKey = commentQueryKeys.all({ infoId });
      const infosQueryKey = infoQueryKeys.all({ threadId });

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const comments = queryClient.getQueryData<Comment[]>(queryKey);

      // Optimistically delete comment
      if (comments) {
        queryClient.setQueryData<Comment[]>(queryKey, () =>
          comments.filter((comment) => comment._id !== commentId),
        );
      }

      // Optimistically decrement comments counter
      const infiniteInfos =
        queryClient.getQueryData<InfiniteData<Info[]>>(infosQueryKey);
      const pages = infiniteInfos?.pages;
      const pageParams = infiniteInfos?.pageParams;
      const info = pages?.flat().find((info) => info.id === infoId);
      if (pages && pageParams && info) {
        info.numberOfComments =
          typeof info.numberOfComments === 'number'
            ? Math.max(info.numberOfComments - 1, 0)
            : 0;
        queryClient.setQueryData<InfiniteData<Info[]>>(infosQueryKey, () => {
          return { pages: [...pages], pageParams: pageParams };
        });
      }

      // Return a result with the snapshotted value
      return { comments, queryKey };
    },
    onSuccess: () => toast.success(t('actualites.comment.deleted')),
    onError: () => toast.success(t('actualites.comment.error')),
    // Always refetch after error or success.
    onSettled: (_data, _error, { infoId }) =>
      queryClient.invalidateQueries({
        queryKey: commentQueryKeys.all({ infoId }),
      }),
  });
};
