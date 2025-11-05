import { Button } from '@edifice.io/react';
import { CommentProvider } from '@edifice.io/react/comments';
import { useI18n } from '~/hooks/useI18n';
import { Info } from '~/models/info';
import { useCommentList } from './useCommentList';

export type CommentListProps = {
  /**
   * Comments to display in the card
   */
  info: Info;
};

export const CommentList = ({ info }: CommentListProps) => {
  const { t } = useI18n();
  const { comments, /*hasMore,*/ type, callbacks /*options*/ } =
    useCommentList(info);

  return comments ? (
    <>
      <CommentProvider
        type={type}
        callbacks={callbacks}
        comments={comments}
      ></CommentProvider>

      <Button color="tertiary" variant="ghost" size="sm">
        {t('actualites.comments.read.more')}
      </Button>
    </>
  ) : null;
};
