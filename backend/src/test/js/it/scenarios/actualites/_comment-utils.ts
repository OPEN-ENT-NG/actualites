import { getHeaders } from "../../../node_modules/edifice-k6-commons/dist/index.js";
import { check } from "k6";
import http, { RefinedResponse } from "k6/http";

const rootUrl = __ENV.ROOT_URL;

export type Comment = {
  comment: string;
  info_id: number;
}

export type CommentResponse = {
  id: number;
  comment: string;
  owner: {
    userId: string;
    username: string;
    displayName: string;
  };
  created: string;
  modified: string;
  info_id: number;
}

export type Identifier = {
  id: number;
}

/**
 * Create a comment on an info
 * @param infoId The info ID to comment on
 * @param commentText The comment text
 * @returns HTTP response
 */
export function createComment(infoId: number, commentText: string): RefinedResponse<any> {
  const comment: Comment = {
    comment: commentText,
    info_id: infoId,
  };
  return http.put(
    `${rootUrl}/actualites/info/${infoId}/comment`,
    JSON.stringify(comment),
    { headers: getHeaders() },
  );
}

/**
 * Create a comment on an info using v1 API
 * @param infoId The info ID to comment on
 * @param commentText The comment text
 * @returns HTTP response
 */
export function createCommentV1(infoId: number, commentText: string): RefinedResponse<any> {
  const comment: Comment = {
    comment: commentText,
    info_id: infoId,
  };
  return http.post(
    `${rootUrl}/actualites/api/v1/infos/${infoId}/comments`,
    JSON.stringify(comment),
    { headers: getHeaders() },
  );
}

/**
 * Create a comment and fail if status is not 200
 * @param infoId The info ID to comment on
 * @param commentText The comment text
 * @returns The created comment identifier
 */
export function createCommentOrFail(infoId: number, commentText: string): Identifier {
  const res = createComment(infoId, commentText);
  check(res, {
    "Creating comment should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}

/**
 * Update a comment
 * @param infoId The info ID
 * @param commentId The comment ID to update
 * @param commentText The new comment text
 * @returns HTTP response
 */
export function updateComment(infoId: number, commentId: number, commentText: string): RefinedResponse<any> {
  const comment: Comment = {
    comment: commentText,
    info_id: infoId,
  };
  return http.put(
    `${rootUrl}/actualites/info/${infoId}/comment/${commentId}`,
    JSON.stringify(comment),
    { headers: getHeaders() },
  );
}

/**
 * Update a comment using v1 API
 * @param infoId The info ID
 * @param commentId The comment ID to update
 * @param commentText The new comment text
 * @returns HTTP response
 */
export function updateCommentV1(infoId: number, commentId: number, commentText: string): RefinedResponse<any> {
  const comment: Comment = {
    comment: commentText,
    info_id: infoId,
  };
  return http.put(
    `${rootUrl}/actualites/api/v1/infos/${infoId}/comments/${commentId}`,
    JSON.stringify(comment),
    { headers: getHeaders() },
  );
}

/**
 * Update a comment and fail if status is not 200
 * @param infoId The info ID
 * @param commentId The comment ID to update
 * @param commentText The new comment text
 * @returns The updated comment response
 */
export function updateCommentOrFail(infoId: number, commentId: number, commentText: string): any {
  const res = updateComment(infoId, commentId, commentText);
  check(res, {
    "Updating comment should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}

/**
 * Delete a comment
 * @param infoId The info ID
 * @param commentId The comment ID to delete
 * @returns HTTP response
 */
export function deleteComment(infoId: number, commentId: number): RefinedResponse<any> {
  return http.del(
    `${rootUrl}/actualites/info/${infoId}/comment/${commentId}`,
    {},
    { headers: getHeaders() },
  );
}

/**
 * Delete a comment using v1 API
 * @param infoId The info ID
 * @param commentId The comment ID to delete
 * @returns HTTP response
 */
export function deleteCommentV1(infoId: number, commentId: number): RefinedResponse<any> {
  return http.del(
    `${rootUrl}/actualites/api/v1/infos/${infoId}/comments/${commentId}`,
    {},
    { headers: getHeaders() },
  );
}

/**
 * Delete a comment and fail if status is not 200
 * @param infoId The info ID
 * @param commentId The comment ID to delete
 * @returns The deletion response
 */
export function deleteCommentOrFail(infoId: number, commentId: number): any {
  const res = deleteComment(infoId, commentId);
  check(res, {
    "Deleting comment should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}

/**
 * Get comments of an info
 * @param infoId The info ID
 * @returns HTTP response with comments list
 */
export function getComments(infoId: number): RefinedResponse<any> {
  return http.get(
    `${rootUrl}/actualites/api/v1/infos/${infoId}/comments`,
    { headers: getHeaders() },
  );
}

/**
 * Get comments of an info and fail if status is not 200
 * @param infoId The info ID
 * @returns The comments list
 */
export function getCommentsOrFail(infoId: number): CommentResponse[] {
  const res = getComments(infoId);
  check(res, {
    "Getting comments should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}
