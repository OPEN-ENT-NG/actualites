import { CommentProvider } from '@edifice.io/react/comments';
import { useCommentList } from '~/hooks/useCommentList';
import { Info } from '~/models/info';

export type CommentListProps = {
  /**
   * Comments to display in the card.
   */
  info: Info;
};

export const CommentList = ({ info }: CommentListProps) => {
  const { comments, type, callbacks, options } = useCommentList(info);

  return (
    comments && (
      <CommentProvider
        type={type}
        callbacks={callbacks}
        comments={comments}
        options={options}
      />
    )
  );
};
