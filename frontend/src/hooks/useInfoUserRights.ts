import { Info } from '~/models/info';

export function useInfoUserRights(info: Info) {
  const canComment =
    info.sharedRights.findIndex((value) => value === 'info.comment') >= 0;
  return {
    canComment,
  };
}
