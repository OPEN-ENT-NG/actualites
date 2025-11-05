import { Info } from '~/models/info';
import { useComments } from '~/services/queries';

export function useCommentList(info: Info) {
  const type: 'read' | 'edit' = 'edit'; // TODO: adapt value depending on user's right.

  const { data } = useComments(info.id);

  // TODO : Mettre en place un Reducer pour simuler la pagination 10 par 10.

  const comments = data?.map((comment) => ({
    id: '' + comment._id,
    comment: comment.comment,
    authorId: comment.owner,
    authorName: comment.username,
    createdAt: comment.created as unknown as number,
    updatedAt: comment.modified as unknown as number,
  }));

  const hasMore = false;

  const callbacks = {
    delete: (_commentId: string) => Promise.reject('not implemented'),
    post: (_comment: string, _replyTo?: string) =>
      Promise.reject('not implemented'),
    put: ({
      comment: _comment,
      commentId: _commentId,
    }: {
      comment: string;
      commentId: string;
    }) => Promise.reject('not implemented'),
  };

  const options = {
    additionalComments: 10,
    additionalReplies: 10,
    maxCommentLength: 800,
    maxComments: 5,
    maxReplies: 2,
    maxReplyLength: 200,
  };

  return { comments, hasMore, type, callbacks, options };
}
