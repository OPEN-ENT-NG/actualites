import { InfoBase, InfoExtendedStatus, InfoStatus } from '~/models/info';

export function useInfoStatus(info?: InfoBase) {
  if (!info) {
    return {
      isIncoming: false,
      isExpired: false,
      extendedStatus: undefined,
    };
  }

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
  };
}
