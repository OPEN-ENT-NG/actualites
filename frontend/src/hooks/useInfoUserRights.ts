import { useUser } from '@edifice.io/react';
import { Info } from '~/models/info';

export function useInfoUserRights(info: Info) {
  const { user } = useUser();
  const isCreator = user?.userId === info.owner.id;
  const canComment =
    info.sharedRights.findIndex((value) => value === 'info.comment') >= 0;
  return {
    isCreator,
    canComment,
  };
}
