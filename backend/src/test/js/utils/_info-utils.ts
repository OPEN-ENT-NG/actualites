import { getHeaders } from "../node_modules/edifice-k6-commons/dist/index.js";
import { check } from "k6";
import http, { RefinedResponse } from "k6/http";

const rootUrl = __ENV.ROOT_URL;

export type Info = {
  title?: string;
  content?: string;
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

export const commentInfoRights = [
  "net-atos-entng-actualites-controllers-CommentController|deleteComment",
  "net-atos-entng-actualites-controllers-CommentController|updateComment",
  "net-atos-entng-actualites-controllers-CommentController|comment"
];

export const infoRead = [
  "net-atos-entng-actualites-controllers-InfoController|getSingleInfo",
  "net-atos-entng-actualites-controllers-InfoController|getInfo",
  "net-atos-entng-actualites-controllers-InfoController|getInfoComments",
  "net-atos-entng-actualites-controllers-InfoController|getInfoShared"
];

export const infoFullRights = [...commentInfoRights, ...infoRead];


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
 * Update an info
 * @param infoId The id of the info to update
 * @param info The info object to update
 * @returns HTTP response
 */
export function updateInfo(infoId: number, info: Info): RefinedResponse<any> {
  return http.put(
    `${rootUrl}/actualites/api/v1/infos/${infoId}`,
    JSON.stringify(info),
    { headers: getHeaders() },
  );
}

/**
 * Update an info and fail if status is not 200
 * @param infoId The id of the info to update
 * @param info The info object to update
 * @returns The created info identifier
 */
export function updateInfoOrFail(infoId: number, info: Info): Identifier {
  const res = updateInfo(infoId, info);
  check(res, {
    "Updating info should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}


export function createPublishedInfo(info: Omit<Info, 'status'>): RefinedResponse<any> {
  return http.post(
    `${rootUrl}/actualites/api/v1/infos/published`,
    JSON.stringify(info),
    { headers: getHeaders() },
  );
}


export function createPublishedInfoOrFail(info: Omit<Info, 'status'>): Identifier {
  const res = createPublishedInfo(info);
  check(res, {
    "Creating published info should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}

/**
 * Create a draft info and then publish/submit it.
 * This follows the correct frontend workflow.
 * @param info The info object to create
 * @param targetStatus The target status: 2 for PENDING (submit), 3 for PUBLISHED (publish)
 * @returns HTTP response from the update call
 */
export function createDraftAndPublish(
  info: Omit<Info, 'status'>,
  targetStatus: 2 | 3 = 3
): { createResponse: RefinedResponse<any>; publishResponse: RefinedResponse<any>; id: number } {
  // Step 1: Create draft
  const createRes = createInfo({ ...info, status: 1 });
  if (createRes.status !== 200) {
    return { createResponse: createRes, publishResponse: createRes, id: 0 };
  }
  const { id } = JSON.parse(createRes.body as string) as Identifier;

  // Step 2: Publish or submit
  const publishRes = updateInfo(id, { ...info, status: targetStatus });

  return { createResponse: createRes, publishResponse: publishRes, id };
}

/**
 * Create a draft info and then publish/submit it, failing if any step fails.
 * @param info The info object to create
 * @param targetStatus The target status: 2 for PENDING (submit), 3 for PUBLISHED (publish)
 * @returns The created info identifier
 */
export function createDraftAndPublishOrFail(
  info: Omit<Info, 'status'>,
  targetStatus: 2 | 3 = 3
): Identifier {
  const { createResponse, publishResponse, id } = createDraftAndPublish(info, targetStatus);
  check(createResponse, {
    "Creating draft info should be ok": (r) => r.status == 200,
  });
  check(publishResponse, {
    "Publishing info should be ok": (r) => r.status == 200,
  });
  return { id };
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

/**
 * Get stats from the API
 * @param statsUrl The stats endpoint URL
 * @returns The parsed stats response
 */
export function getStats(statsUrl: string) {
  const res = http.get(statsUrl, { headers: getHeaders() });
  check(res, { "Stats query should succeed": (r) => r.status === 200 });
  return JSON.parse(res.body as string);
}

/**
 * Get stats for a specific thread
 * @param statsUrl The stats endpoint URL
 * @param threadId The thread ID
 * @returns The thread stats object
 */
export function getThreadStats(statsUrl: string, threadId: number | string) {
  const stats = getStats(statsUrl);
  return stats.threads.find((t: any) => t.id === parseInt(threadId as string));
}

/**
 * Format a date to ISO string without milliseconds
 * @param date The date to format
 * @returns The formatted date string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('.')[0];
}
