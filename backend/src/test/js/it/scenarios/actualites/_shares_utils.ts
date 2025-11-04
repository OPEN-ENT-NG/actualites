import { getHeaders } from "../../../node_modules/edifice-k6-commons/dist/index.js";
import http, { RefinedResponse } from "k6/http";

const rootUrl = __ENV.ROOT_URL;

export type Shares = {
  users: any;
  groups: any;
  sharedBookmarks: any;
}

export enum ShareTargetType {
  USER = 'USER',
  GROUP = 'GROUP'
}

export function shareInfos(infoId: string, shares: Shares) :  RefinedResponse<any> {
  return http.put(`${rootUrl}/actualites/api/v1/infos/${infoId}/shares`,
    JSON.stringify(shares),
    { headers: getHeaders() })
}

export function shareThreads(threadId: string, shares: Shares) :  RefinedResponse<any> {
  return http.put(`${rootUrl}/actualites/api/v1/threads/${threadId}/shares`,
    JSON.stringify(shares),
    { headers: getHeaders() })
}

export function addUserSharesInfos(shares: Shares, userId: string, rights: string[]) :  Shares {
  const updatesShares = structuredClone(shares);
  let userRights: string[] = shares.users[userId];
  if(!userRights) {
    userRights = rights;
  } else {
    rights.forEach((r) => {
      if(!userRights.includes(r)) {
        userRights.push(r)
      }
    });
  }
  updatesShares.users[userId] = userRights;
  return updatesShares;
}

export function addGroupSharesInfos(shares: Shares, groupId: string, rights: string[]) :  Shares {
  const updatedShares = structuredClone(shares);
  let groupRights: string[] = shares.groups[groupId];
  if(!groupRights) {
    groupRights = rights;
  } else {
    rights.forEach((r) => {
      if(!groupRights.includes(r)) {
        groupRights.push(r)
      }
    });
  }
  updatedShares.groups[groupId] = groupRights;
  return updatedShares;
}

export function removeSharesInfos(shares: Shares, id: number) :  Shares {
  const updatedShares = structuredClone(shares);

  let groupRights: string[] = shares.groups[id];
  let userRights: string[] = shares.users[id];

  if (userRights) {
    delete updatedShares.users[id];
  }
  if (groupRights) {
    delete updatedShares.groups[id];
  }

  return updatedShares;
}

function structuredClone(shares: Shares): Shares {
  return { ...shares, users: {...shares.users}, groups: {...shares.groups}, sharedBookmarks: {...shares.sharedBookmarks} } ;
}

