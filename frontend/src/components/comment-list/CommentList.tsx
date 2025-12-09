import { CommentProvider } from '@edifice.io/react/comments';
import { useCommentList } from '~/hooks/useCommentList';
import { Info } from '~/models/info';

const MAX_COMMENTS_WITHOUT_PAGINATION = 100;

export type CommentListProps = {
  /**
   * Comments to display in the card.
   */
  info: Info;
  withPagination?: boolean;
};

export const CommentList = ({
  info,
  withPagination = true,
}: CommentListProps) => {
  const { comments, type, callbacks, options, rights } = useCommentList(info);

  if (!withPagination)
    options.maxComments = options.additionalComments =
      MAX_COMMENTS_WITHOUT_PAGINATION;

  return (
    comments && (
      <CommentProvider
        type={type}
        callbacks={callbacks}
        comments={comments}
        options={options}
        rights={rights}
      />
    )
  );
};
