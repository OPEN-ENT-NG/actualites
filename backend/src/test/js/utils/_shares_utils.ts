import { getHeaders } from "../node_modules/edifice-k6-commons/dist/index.js";
import http, { RefinedResponse } from "k6/http";
import { check } from "k6";

const rootUrl = __ENV.ROOT_URL;

export type Shares = {
  users?: any;
  groups?: any;
  sharedBookmarks?: any;
}

export type RightsMapping = {
  actions: Array<{
    displayName: string;
    name: string;
    type: string;
  }>;
}

export type ShareResponse = {
  owner?: string;
  rights?: any;
  groups?: {
    visibles: Array<{
      id: string;
      name: string;
      structureName?: string;
    }>;
  };
  users?: {
    visibles: Array<{
      id: string;
      displayName: string;
    }>;
  };
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

export function shareInfosOrFail(infoId: string, shares: Shares) {
  const resp = shareInfos(infoId, shares);
  check(resp, { "Share update should succeed": (r) => r.status === 200 });
  return resp;
}

export function shareThreads(threadId: string, shares: Shares) :  RefinedResponse<any> {
  return http.put(`${rootUrl}/actualites/api/v1/threads/${threadId}/shares`,
    JSON.stringify(shares),
    { headers: getHeaders() })
}

export function shareThreadsOrFail(threadId: string, shares: Shares) {
  const resp = shareThreads(threadId, shares);
  check(resp, { "Share update should succeed": (r) => r.status === 200 });
  return resp;
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

/**
 * Get the rights mapping from the API.
 * This returns the available share actions for the application.
 * @returns HTTP response containing the rights mapping
 */
export function getRightsMapping(): RefinedResponse<any> {
  return http.get(
    `${rootUrl}/actualites/api/v1/rights/sharing`,
    { headers: getHeaders() }
  );
}

/**
 * Get the rights mapping and fail if the request fails.
 * @returns The parsed rights mapping
 */
export function getRightsMappingOrFail(): RightsMapping {
  const res = getRightsMapping();
  check(res, { "Get rights mapping should succeed": (r) => r.status === 200 });
  return JSON.parse(res.body as string);
}

/**
 * Get current shares for an info.
 * @param infoId The info ID
 * @returns HTTP response containing the share information
 */
export function getInfoShares(infoId: string): RefinedResponse<any> {
  return http.get(
    `${rootUrl}/actualites/api/v1/infos/${infoId}/shares`,
    { headers: getHeaders() }
  );
}

/**
 * Get current shares for an info and fail if the request fails.
 * @param infoId The info ID
 * @returns The parsed share response
 */
export function getInfoSharesOrFail(infoId: string): ShareResponse {
  const res = getInfoShares(infoId);
  check(res, { "Get info shares should succeed": (r) => r.status === 200 });
  return JSON.parse(res.body as string);
}

/**
 * Get current shares for a thread.
 * @param threadId The thread ID
 * @returns HTTP response containing the share information
 */
export function getThreadShares(threadId: string): RefinedResponse<any> {
  return http.get(
    `${rootUrl}/actualites/api/v1/threads/${threadId}/shares`,
    { headers: getHeaders() }
  );
}

/**
 * Get current shares for a thread and fail if the request fails.
 * @param threadId The thread ID
 * @returns The parsed share response
 */
export function getThreadSharesOrFail(threadId: string): ShareResponse {
  const res = getThreadShares(threadId);
  check(res, { "Get thread shares should succeed": (r) => r.status === 200 });
  return JSON.parse(res.body as string);
}

/**
 * Build a share payload from the share response groups.
 * Selects groups that match the specified suffixes and assigns the specified rights.
 * @param shareResponse The share response containing available groups
 * @param groupSuffixes Array of group name suffixes to match (e.g., ['Relative', 'Student', 'Teacher', 'Personnel'])
 * @param rights Array of rights to assign to matched groups
 * @returns A Shares object ready to be sent to the API
 */
export function buildSharePayloadFromGroups(
  shareResponse: ShareResponse,
  groupSuffixes: string[],
  rights: string[]
): Shares {
  const shares: Shares = { users: {}, groups: {}, sharedBookmarks: {} };

  if (shareResponse.groups?.visibles) {
    for (const group of shareResponse.groups.visibles) {
      // Match groups without structureName that end with one of the suffixes
      if (!group.structureName) {
        for (const suffix of groupSuffixes) {
          if (group.name.endsWith(suffix)) {
            shares.groups[group.id] = rights;
            break;
          }
        }
      }
    }
  }

  return shares;
}

