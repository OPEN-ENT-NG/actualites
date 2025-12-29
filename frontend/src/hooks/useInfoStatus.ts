import { InfoBase, InfoExtendedStatus, InfoStatus } from '~/models/info';

export function useInfoStatus(info?: InfoBase) {
  if (!info) {
    return {
      isIncoming: false,
      isExpired: false,
      extendedStatus: undefined,
    };
  }
  console.log('info:', info);
  const isPending = info.status === InfoStatus.PENDING;
  const isIncoming =
    info.status === InfoStatus.PUBLISHED &&
    !!info.publicationDate &&
    new Date(info.publicationDate) > new Date();
  const isExpired =
    info.status === InfoStatus.PUBLISHED &&
    !!info.expirationDate &&
    new Date(info.expirationDate) < new Date();

  let extendedStatus: InfoExtendedStatus | undefined;
  if (isIncoming) {
    extendedStatus = InfoExtendedStatus.INCOMING;
  } else if (isExpired) {
    extendedStatus = InfoExtendedStatus.EXPIRED;
  } else {
    extendedStatus = undefined;
  }

  return {
    isIncoming,
    isExpired,
    extendedStatus,
    isPending,
    isDraft: info.status === InfoStatus.DRAFT,
    isPublished: info.status === InfoStatus.PUBLISHED,
    canShowComments:
      (info.status === InfoStatus.PUBLISHED && !isIncoming) ||
      (info.status === InfoStatus.DRAFT && info.numberOfComments > 0),
  };
}
