import { getHeaders } from "../../../node_modules/edifice-k6-commons/dist/index.js";
import { check } from "k6";
import http, { RefinedResponse } from "k6/http";

const rootUrl = __ENV.ROOT_URL;

export type Info = {
  title: string;
  content: string;
  status?: number;
  thread_id: number;
  publication_date?: string;
  expiration_date?: string;
  is_headline?: boolean;
}

export type InfoResponse = {
  id: number;
  threadId: number;
  title: string;
  content: string;
  status: string;
  owner: {
    userId: string;
    username: string;
  };
  created: string;
  modified: string;
  publicationDate?: string;
  expirationDate?: string;
  headline: boolean;
  numberOfComments: number;
  sharedRights: string[];
  thread?: {
    id:number;
  }
}

export type Identifier = {
  id: number;
}

/**
 * Create an info with draft or pending status
 * @param info The info object to create
 * @returns HTTP response
 */
export function createInfo(info: Info): RefinedResponse<any> {
  return http.post(
    `${rootUrl}/actualites/api/v1/infos`,
    JSON.stringify(info),
    { headers: getHeaders() },
  );
}

/**
 * Create an info with draft or pending status and fail if status is not 200
 * @param info The info object to create
 * @returns The created info identifier
 */
export function createInfoOrFail(info: Info): Identifier {
  const res = createInfo(info);
  check(res, {
    "Creating info should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}

/**
 * Create a published info directly
 * @param info The info object to create (status will be automatically set to 3)
 * @returns HTTP response
 */
export function createPublishedInfo(info: Omit<Info, 'status'>): RefinedResponse<any> {
  return http.post(
    `${rootUrl}/actualites/api/v1/infos/published`,
    JSON.stringify(info),
    { headers: getHeaders() },
  );
}

/**
 * Create a published info directly and fail if status is not 200
 * @param info The info object to create (status will be automatically set to 3)
 * @returns The created info identifier
 */
export function createPublishedInfoOrFail(info: Omit<Info, 'status'>): Identifier {
  const res = createPublishedInfo(info);
  check(res, {
    "Creating published info should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}

/**
 * Get an info by its ID
 * @param infoId The info ID
 * @returns The info object
 */
export function getInfoById(infoId: number): InfoResponse {
  const res = http.get(
    `${rootUrl}/actualites/api/v1/infos/${infoId}`,
    { headers: getHeaders() },
  );
  check(res, {
    "Get info should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}

/**
 * Try to get an info by its ID (without checking success)
 * @param infoId The info ID
 * @returns HTTP response
 */
export function tryGetInfoById(infoId: number): RefinedResponse<any> {
  return http.get(
    `${rootUrl}/actualites/api/v1/infos/${infoId}`,
    { headers: getHeaders() },
  );
}

/**
 * Delete an info by its ID
 * @param infoId The info ID
 * @returns HTTP response
 */
export function deleteInfo(infoId: number): RefinedResponse<any> {
  return http.del(
    `${rootUrl}/actualites/api/v1/infos/${infoId}`,
    {},
    { headers: getHeaders() },
  );
}

/**
 * Delete an info by its ID and fail if status is not 200
 * @param infoId The info ID
 * @returns The deletion response
 */
export function deleteInfoOrFail(infoId: number): any {
  const res = deleteInfo(infoId);
  check(res, {
    "Deleting info should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}
