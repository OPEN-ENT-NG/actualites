import { describe } from "https://jslib.k6.io/k6chaijs/4.3.4.0/index.js";

import {
  authenticateWeb,
  getUsersOfSchool,
  initStructure,
  getRandomUserWithProfile,
  Session,
  Structure,
  Role,
  getTeacherRole,
  createAndSetRole,
  linkRoleToUsers,
} from '../../../node_modules/edifice-k6-commons/dist/index.js';
import {
  createThreadOrFail,
  Identifier as ThreadIdentifier,
} from "./_thread-utils.ts";
import {
  createInfoOrFail,
  createPublishedInfoOrFail,
} from "./_info-utils.ts";
import { check } from "k6";
import http, { RefinedResponse } from "k6/http";
import { getHeaders } from "../../../node_modules/edifice-k6-commons/dist/index.js";

const maxDuration = __ENV.MAX_DURATION || "5m";
const schoolName = __ENV.DATA_SCHOOL_NAME || `Info Widget tests `;
const gracefulStop = parseInt(__ENV.GRACEFUL_STOP || "2s");
const rootUrl = __ENV.ROOT_URL;

export const options = {
  setupTimeout: "1h",
  thresholds: {
    checks: ["rate == 1.00"],
  },
  scenarios: {
    testWidget: {
      executor: "per-vu-iterations",
      exec: "testWidget",
      vus: 1,
      maxDuration: maxDuration,
      gracefulStop,
    },
  },
};

type InitData = {
  head: Structure;
  teacher?: any;
  publishedInfos: number[];
}

export function setup() {
  let head: Structure | null = null;
  let teacher: any = null;
  const publishedInfos: number[] = [];

  describe("[Info-Widget-Init] Initialize data", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    head = initStructure(`${schoolName} - Head`)
    const teacherProfileGroup = getTeacherRole(head);
    const role: Role = createAndSetRole("Actualites");
    linkRoleToUsers(head, role, [teacherProfileGroup.name]);

    const headUsers = getUsersOfSchool(head);
    teacher = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Selected teacher for all tests: " + teacher.login);
    authenticateWeb(teacher.login);

    const seed = Math.random().toString(36).substring(7);

    const thread: ThreadIdentifier = createThreadOrFail(`Thread 1 ${seed}`);
    const now = new Date();
    const futureExpirationDate = new Date(now.getTime() + 3600*24*1000);

    //last published info
    let publishedInfo = createPublishedInfoOrFail({
      title: `Incoming info ${seed}`,
      content: `Incoming content`,
      thread_id: parseInt(thread.id as string),
      status: 3,
      publication_date: "2020-01-01",
      expiration_date: futureExpirationDate.toUTCString(),
    } as any);

    publishedInfos.push(publishedInfo.id);

    publishedInfo = createPublishedInfoOrFail({
      title: `Incoming info ${seed}`,
      content: `Incoming content`,
      thread_id: parseInt(thread.id as string),
      status: 3,
      publication_date: "2020-01-01",
      expiration_date: futureExpirationDate.toUTCString(),
    } as any);

    publishedInfos.push(publishedInfo.id);

    //draft should not be visible
    createInfoOrFail({
      title: `Incoming info ${seed}`,
      content: `Incoming content`,
      thread_id: parseInt(thread.id as string),
      status: 1,
      publication_date: "2020-01-01",
      expiration_date: futureExpirationDate.toUTCString(),
    } as any);

    //pending should not be visible
    createInfoOrFail({
      title: `Incoming info ${seed}`,
      content: `Incoming content`,
      thread_id: parseInt(thread.id as string),
      status: 2,
      publication_date: "2020-01-01",
      expiration_date: futureExpirationDate.toUTCString(),
    } as any);

    publishedInfo = createPublishedInfoOrFail({
      title: `Incoming info ${seed}`,
      content: `Incoming content`,
      thread_id: parseInt(thread.id as string),
      status: 3,
      publication_date: "2020-01-01",
      expiration_date: futureExpirationDate.toUTCString(),
    } as any);

    publishedInfos.push(publishedInfo.id);

    publishedInfo = createPublishedInfoOrFail({
      title: `Incoming info ${seed}`,
      content: `Incoming content`,
      thread_id: parseInt(thread.id as string),
      status: 3,
      publication_date: "2020-01-01",
      expiration_date: futureExpirationDate.toUTCString(),
    } as any);

    publishedInfos.push(publishedInfo.id);

    //expired info
    createPublishedInfoOrFail({
      title: `Incoming info ${seed}`,
      content: `Incoming content`,
      thread_id: parseInt(thread.id as string),
      status: 3,
      publication_date: "2020-01-01",
      expiration_date: "2021-01-01",
    } as any);

    //incoming info
    createPublishedInfoOrFail({
      title: `Incoming info ${seed}`,
      content: `Incoming content`,
      thread_id: parseInt(thread.id as string),
      status: 3,
      publication_date:  futureExpirationDate.toUTCString()
    } as any);

    publishedInfo = createPublishedInfoOrFail({
      title: `Incoming info ${seed}`,
      content: `Incoming content`,
      thread_id: parseInt(thread.id as string),
      status: 3,
      publication_date: "2020-01-01",
      expiration_date: futureExpirationDate.toUTCString(),
    } as any);

    publishedInfos.push(publishedInfo.id);

  });
  return { head, teacher, publishedInfos };
}

export function testWidget(data: InitData) {

  // ============================================================
  // SECTION 1: Default behavior and pagination
  // ============================================================

  describe('[Info-Widget] Test default behavior', () => {
    authenticateWeb(data.teacher.login);

    const url = `${rootUrl}/actualites/api/v1/infos/preview/last/4`;
    const res = http.get(url, { headers: getHeaders() });
    const infos = JSON.parse(res.body as string);

    check(infos, {
      "Default query returns an array": (list) => Array.isArray(list),
    });

    check( infos, {
      "Result should contain 4 elements": (result: any[]) => result.length === 4,
      "Result should contain the last 4 id in reversed order": (result: any[]) => {
        let test = true;
        for(let i = 0; i < result.length; i++) {
          console.log(`info ${i} - ${result[i].id}, ${data.publishedInfos[data.publishedInfos.length - i - 1]}`);
          test &&= result[i].id === data.publishedInfos[data.publishedInfos.length - i - 1];
        }
        return test;
      }
    });
  });

  describe('[Info-Widget] Test different size', () => {
    authenticateWeb(data.teacher.login);

    const url = `${rootUrl}/actualites/api/v1/infos/preview/last/5`;
    const res = http.get(url, { headers: getHeaders() });
    const infos = JSON.parse(res.body as string);

    check(infos, {
      "Default query returns an array": (list) => Array.isArray(list),
    });

    check( infos, {
      "Result should contain 5 elements": (result: any[]) => result.length === 5,
      "Result should contain the last 5 id in reversed order": (result: any[]) => {
        let test = true;
        for(let i = 0; i < result.length; i++) {
          test &&= result[i].id === data.publishedInfos[data.publishedInfos.length - i - 1];
        }
        return test;
      }
    });

  });


  // ============================================================
  // SECTION 2: Invalid parameters
  // ============================================================

  describe('[Info-Widget] Test invalid parameters', () => {
    authenticateWeb(data.teacher.login);

    // Invalid page parameter
    const urlInvalidPage = `${rootUrl}/actualites/api/v1/infos/preview/last/0`;
    const resInvalidPage = http.get(urlInvalidPage, { headers: getHeaders() });
    check(resInvalidPage, {
      "Invalid size parameter should failed": (r) => r.status === 400,
    });

    // Invalid pageSize parameter
    const urlInvalidPageSize = `${rootUrl}/actualites/api/v1/infos/preview/last/21`;
    const resInvalidPageSize = http.get(urlInvalidPageSize, { headers: getHeaders() });
    check(resInvalidPageSize, {
      "Invalid size parameter should failed": (r) => r.status === 400,
    });
  });
}
