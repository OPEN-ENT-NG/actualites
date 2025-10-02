import { getHeaders } from "../../../node_modules/edifice-k6-commons/dist/index.js";
import { check } from "k6";
import http from "k6/http";

const rootUrl = __ENV.ROOT_URL;

export type Thread = {
  icon: string;
  title: string;
  mode: number;
}

export type Identifier = {
  id: string;
}

export function createThread(title: String) : Identifier {
  let res = http.post(
    `${rootUrl}/actualites/api/v1/threads`,
    `{ "title": "${title}", "mode": 0, "icon": ""}`,
    { headers: getHeaders() },
  );
  check(res, {
    "Creating thread should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}

export function updateThread(thread: Thread, threadId: String) : Identifier {
  let res = http.put(
    `${rootUrl}/actualites/api/v1/threads/${threadId}`,
    JSON.stringify(thread),
    { headers: getHeaders() },
  );
  check(res, {
    "Updating thread should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
}

export function deleteThread(threadId: String) : Identifier {
  let res = http.del(
    `${rootUrl}/actualites/api/v1/threads/${threadId}`,
    {},
    { headers: getHeaders() },
  );
  check(res, {
    "Deleting thread should be ok": (r) => r.status == 200,
  });
  return JSON.parse(res.body as string);
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