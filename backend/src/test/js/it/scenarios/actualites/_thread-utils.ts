import { getHeaders } from "../../../node_modules/edifice-k6-commons/dist/index.js";
import { check } from "k6";
import http, { RefinedResponse } from "k6/http";
import { ShareTargetType } from "./_shares_utils.ts";

const rootUrl = __ENV.ROOT_URL;

export type Thread = {
  icon: string;
  title: string;
  mode: number;
}

export type Identifier = {
  id: string;
}

export enum ThreadRight {
  CONTRIBUTOR = 'CONTRIBUTOR',
  PUBLISHER = 'PUBLISHER',
  MANAGER = 'MANAGER',
}

export const threadContributorRights: string[] = [ "net-atos-entng-actualites-controllers-InfoController|unsubmit",
  "net-atos-entng-actualites-controllers-InfoController|updateDraft",
  "net-atos-entng-actualites-controllers-InfoController|listInfosByThreadId",
  "net-atos-entng-actualites-controllers-InfoController|shareInfoSubmit",
  "net-atos-entng-actualites-controllers-InfoController|createPending",
  "net-atos-entng-actualites-controllers-InfoController|createDraft",
  "net-atos-entng-actualites-controllers-InfoController|shareInfo",
  "net-atos-entng-actualites-controllers-InfoController|shareInfoRemove",
  "net-atos-entng-actualites-controllers-InfoController|shareResourceInfo",
  "net-atos-entng-actualites-controllers-InfoController|submit",
  "net-atos-entng-actualites-controllers-ThreadController|getThread"];

export const threadPublisherRights: string[] = [ "net-atos-entng-actualites-controllers-InfoController|getInfoTimeline",
  "net-atos-entng-actualites-controllers-InfoController|createPublished",
  "net-atos-entng-actualites-controllers-InfoController|updatePending",
  "net-atos-entng-actualites-controllers-InfoController|unpublish",
  "net-atos-entng-actualites-controllers-InfoController|publish",
  "net-atos-entng-actualites-controllers-InfoController|updatePublished"];

export const threadManagerRights: string[] = [ "net-atos-entng-actualites-controllers-ThreadController|shareResource",
  "net-atos-entng-actualites-controllers-ThreadController|shareThreadSubmit",
  "net-atos-entng-actualites-controllers-InfoController|delete",
  "net-atos-entng-actualites-controllers-ThreadController|deleteThread",
  "net-atos-entng-actualites-controllers-ThreadController|shareThread",
  "net-atos-entng-actualites-controllers-ThreadController|shareThreadRemove",
  "net-atos-entng-actualites-controllers-ThreadController|updateThread"];


export function createThreadOrFail(title: String) : Identifier {
  let res = createThread(title);
  check(res, {
    "Creating thread should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}

export function createThread(title: String) : RefinedResponse<any> {
 return http.post(
    `${rootUrl}/actualites/api/v1/threads`,
    `{ "title": "${title}", "mode": 0, "icon": ""}`,
    { headers: getHeaders() },
  );
}

export function updateThreadOrFail(thread: Thread, threadId: String) : Identifier {
  let res = updateThread(thread, threadId)
  check(res, {
    "Updating thread should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}

export function updateThread(thread: Thread, threadId: String) : RefinedResponse<any> {
  return http.put(
    `${rootUrl}/actualites/api/v1/threads/${threadId}`,
    JSON.stringify(thread),
    { headers: getHeaders() },
  );
}

export function deleteThreadOrFail(threadId: String) : Identifier {
  let res = deleteThread(threadId);
  check(res, {
    "Deleting thread should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}

export function deleteThread(threadId: String) : RefinedResponse<any> {
  return http.del(
    `${rootUrl}/actualites/api/v1/threads/${threadId}`,
    {},
    { headers: getHeaders() },
  );
}

export function getThreadById(id: String) : Thread {
  let res = http.get(
    `${rootUrl}/actualites/api/v1/threads/${id}`,
    { headers: getHeaders() },
  );
  check(res, {
    "Get thread should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}

export function threadExists(id: String) : void {
  let res = http.get(
    `${rootUrl}/actualites/api/v1/threads/${id}`,
    { headers: getHeaders() },
  );
  check(res, {
    "Thread should not exists ": (r) => r.status == 401,
  });
}

export function shareThreadOrFail(threadId: string, ids: string[], rights: string[], shareTargetType: ShareTargetType) {
  const resp = shareThread(threadId, ids, rights, shareTargetType);
  check(resp, {
    "Thread sharing must succeed ": (r) => r.status < 300,
  });
}

export function shareThread(threadId: string, ids: string[], rights: string[], shareTargetType: ShareTargetType) :  RefinedResponse<any> {

  let body = {
    users: {},
    groups: {},
    bookmark: {}
  }

  for(let i = 0; i < ids.length; i++) {
    switch(shareTargetType){
      case ShareTargetType.USER:
        (body.users as any)[ids[i]] = rights;
        break;
      case ShareTargetType.GROUP:
        (body.groups as any)[ids[i]] = rights;
        break;
    }
  }

  return http.put(`${rootUrl}/actualites/api/v1/threads/${threadId}/shares`,
    JSON.stringify(body),
    { headers: getHeaders() })
}

export function getShareThread(threadId: string) :  RefinedResponse<any> {
  return http.get(`${rootUrl}/actualites/api/v1/threads/${threadId}/shares?search=`)
}