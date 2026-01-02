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
} from "../../../utils/_thread-utils.ts";
import {
  createInfoOrFail,
  createPublishedInfoOrFail,
} from "../../../utils/_info-utils.ts";
import { check } from "k6";
import http, { RefinedResponse } from "k6/http";
import { getHeaders } from "../../../node_modules/edifice-k6-commons/dist/index.js";

const maxDuration = __ENV.MAX_DURATION || "5m";
const schoolName = __ENV.DATA_SCHOOL_NAME || `Info list tests `;
const gracefulStop = parseInt(__ENV.GRACEFUL_STOP || "2s");
const rootUrl = __ENV.ROOT_URL;

export const options = {
  setupTimeout: "1h",
  thresholds: {
    checks: ["rate == 1.00"],
  },
  scenarios: {
    testInfoList: {
      executor: "per-vu-iterations",
      exec: "testInfoList",
      vus: 1,
      maxDuration: maxDuration,
      gracefulStop,
    },
  },
};

type InitData = {
  head: Structure;
  teacher?: any;
  threadId?: string;
  thread2Id?: string;
  expiredId?: number;
  incomingId?: number;
  currentId?: number;
  draftId?: number;
  pendingId?: number;
  thread2InfoId?: number;
}

export function setup() {
  let head: Structure | null = null;
  let teacher: any = null;
  describe("[Info-List-Init] Initialize data", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    head = initStructure(`${schoolName} - Head`)
    const teacherProfileGroup = getTeacherRole(head);
    const role: Role = createAndSetRole("Actualites");
    linkRoleToUsers(head, role, [teacherProfileGroup.name]);

    const headUsers = getUsersOfSchool(head);
    teacher = getRandomUserWithProfile(headUsers, 'Teacher');
    console.log("Selected teacher for all tests: " + teacher.login);
  });
  return { head, teacher };
}

/**
 * Helper function to check if a date is in the past (expired)
 */
function isExpired(expirationDate: string | null | undefined): boolean {
  if (!expirationDate) return false;
  const expDate = new Date(expirationDate);
  const now = new Date();
  return expDate < now;
}

/**
 * Helper function to check if a date is in the future (incoming)
 */
function isIncoming(publicationDate: string | null | undefined): boolean {
  if (!publicationDate) return false;
  const pubDate = new Date(publicationDate);
  const now = new Date();
  return pubDate > now;
}

export function testInfoList(data: InitData) {

  // ============================================================
  // SETUP: Create test data
  // ============================================================

  describe('[Info-List] Setup test data', () => {
    authenticateWeb(data.teacher.login);

    const seed = Math.random().toString(36).substring(7);

    // Create first thread
    console.log("Creating thread 1");
    const thread: ThreadIdentifier = createThreadOrFail(`Thread 1 ${seed}`, data.head.id);
    console.log(`Thread 1 id: ${thread.id}`);

    // Create 25 EXPIRED published infos for pagination testing
    console.log("Creating 25 expired infos for pagination testing");
    const expiredIds: number[] = [];
    for (let i = 0; i < 25; i++) {
      const expiredCreated = createPublishedInfoOrFail({
        title: `Expired info ${i} ${seed}`,
        content: `Expired content ${i}`,
        thread_id: parseInt(thread.id as string),
        status: 3,
        publication_date: "2020-01-01T00:00:00Z",
        expiration_date: "2020-12-31T00:00:00Z",
      } as any);
      expiredIds.push(expiredCreated.id);
    }
    console.log(`Created ${expiredIds.length} expired infos`);

    // Create INCOMING published info
    const incomingCreated = createPublishedInfoOrFail({
      title: `Incoming info ${seed}`,
      content: `Incoming content`,
      thread_id: parseInt(thread.id as string),
      status: 3,
      publication_date: "2030-01-01T00:00:00Z",
      expiration_date: "2030-12-31T00:00:00Z",
    } as any);
    console.log(`Incoming info id: ${incomingCreated.id}`);

    // Create CURRENT published info
    const currentCreated = createPublishedInfoOrFail({
      title: `Current info ${seed}`,
      content: `Current content`,
      thread_id: parseInt(thread.id as string),
      status: 3,
      publication_date: "2020-01-01T00:00:00Z",
      expiration_date: "2035-12-31T00:00:00Z",
    } as any);
    console.log(`Current info id: ${currentCreated.id}`);

    // Create DRAFT info
    const draftCreated = createInfoOrFail({
      title: `Draft info ${seed}`,
      content: `Draft content`,
      thread_id: parseInt(thread.id as string),
      status: 1,
    } as any);
    console.log(`Draft info id: ${draftCreated.id}`);

    // Create PENDING info
    const pendingCreated = createInfoOrFail({
      title: `Pending info ${seed}`,
      content: `Pending content`,
      thread_id: parseInt(thread.id as string),
      status: 2,
    } as any);
    console.log(`Pending info id: ${pendingCreated.id}`);

    // Create second thread
    console.log("Creating thread 2");
    const thread2: ThreadIdentifier = createThreadOrFail(`Thread 2 ${seed}`, data.head.id);
    console.log(`Thread 2 id: ${thread2.id}`);

    // Create published info in thread 2
    const thread2InfoCreated = createPublishedInfoOrFail({
      title: `Thread 2 info ${seed}`,
      content: `Thread 2 content`,
      thread_id: parseInt(thread2.id as string),
      status: 3,
      publication_date: "2020-01-01T00:00:00Z",
      expiration_date: "2035-12-31T00:00:00Z",
    } as any);
    console.log(`Thread 2 info id: ${thread2InfoCreated.id}`);

    // Store IDs for validation
    (data as any).expiredId = expiredIds[0];
    (data as any).incomingId = incomingCreated.id;
    (data as any).currentId = currentCreated.id;
    (data as any).draftId = draftCreated.id;
    (data as any).pendingId = pendingCreated.id;
    (data as any).threadId = thread.id;
    (data as any).thread2Id = thread2.id;
    (data as any).thread2InfoId = thread2InfoCreated.id;
  });

  // ============================================================
  // SECTION 1: Default behavior and pagination
  // ============================================================

  describe('[Info-List] Test default behavior', () => {
    authenticateWeb(data.teacher.login);

    const threadId = (data as any).threadId;
    const url = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=100&threadIds=${threadId}`;
    const res = http.get(url, { headers: getHeaders() });
    const infos = JSON.parse(res.body as string);

    check(infos, {
      "Default query returns an array": (list) => Array.isArray(list),
    });

    const hasExpired = infos.some((info: any) => info.id === (data as any).expiredId);
    const hasIncoming = infos.some((info: any) => info.id === (data as any).incomingId);
    const hasCurrent = infos.some((info: any) => info.id === (data as any).currentId);

    check({ hasExpired, hasIncoming, hasCurrent }, {
      "Default query should NOT return expired news": (result) => result.hasExpired === false,
      "Default query should NOT return incoming news": (result) => result.hasIncoming === false,
      "Default query SHOULD return current news": (result) => result.hasCurrent === true,
    });
  });

  describe('[Info-List] Test default pageSize', () => {
    authenticateWeb(data.teacher.login);

    const url = `${rootUrl}/actualites/api/v1/infos?page=0`;
    const res = http.get(url, { headers: getHeaders() });

    check(res, {
      "Query without pageSize should succeed": (r) => r.status === 200,
    });

    const infos = JSON.parse(res.body as string);
    check(infos, {
      "Query without pageSize returns an array": (list) => Array.isArray(list),
      "Query without pageSize should return at most DEFAULT_PAGE_SIZE (20) items": (list) =>
        Array.isArray(list) && list.length <= 20,
    });
  });

  describe('[Info-List] Test pagination', () => {
    authenticateWeb(data.teacher.login);

    const threadId = (data as any).threadId;

    // Test page 0 with pageSize=20 (we created 25 expired infos)
    const url1 = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=20&state=expired&threadIds=${threadId}`;
    const res1 = http.get(url1, { headers: getHeaders() });

    check(res1, {
      "Pagination page 0 should succeed": (r) => r.status === 200,
    });

    const page0 = JSON.parse(res1.body as string);
    check(page0, {
      "Page 0 should return exactly 20 results": (list) => Array.isArray(list) && list.length === 20,
      "Page 0 results should all be expired": (list) => list.every((info: any) => isExpired(info.expirationDate)),
    });

    // Test page 1 should have the remaining 5 expired infos
    const url2 = `${rootUrl}/actualites/api/v1/infos?page=1&pageSize=20&state=expired&threadIds=${threadId}`;
    const res2 = http.get(url2, { headers: getHeaders() });

    check(res2, {
      "Pagination page 1 should succeed": (r) => r.status === 200,
    });

    const page1 = JSON.parse(res2.body as string);
    check(page1, {
      "Page 1 should return exactly 5 results": (list) => Array.isArray(list) && list.length === 5,
      "Page 1 results should all be expired": (list) => list.every((info: any) => isExpired(info.expirationDate)),
    });
  });

  describe('[Info-List] Test pageSize exceeding MAX_PAGE_SIZE', () => {
    authenticateWeb(data.teacher.login);

    const url = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=200`;
    const res = http.get(url, { headers: getHeaders() });

    check(res, {
      "Query with pageSize > MAX should succeed": (r) => r.status === 200,
    });

    const infos = JSON.parse(res.body as string);
    check(infos, {
      "PageSize > MAX should return at most DEFAULT_PAGE_SIZE items": (list) =>
        Array.isArray(list) && list.length <= 20,
    });
  });

  // ============================================================
  // SECTION 2: ThreadIds filters
  // ============================================================

  describe('[Info-List] Test single threadId filter', () => {
    authenticateWeb(data.teacher.login);

    const threadId = (data as any).threadId;
    const url = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=100&threadIds=${threadId}`;
    const res = http.get(url, { headers: getHeaders() });

    check(res, {
      "Single threadId query should succeed": (r) => r.status === 200,
    });

    const infos = JSON.parse(res.body as string);
    const hasThread1Info = infos.some((info: any) => info.id === (data as any).currentId);

    check({ hasThread1Info }, {
      "Single threadId SHOULD return infos from thread 1": (result) => result.hasThread1Info === true,
    });

    if (infos.length > 0) {
      const allFromThread1 = infos.every((info: any) => info.threadId === parseInt(threadId));
      check({ allFromThread1 }, {
        "All infos should belong to thread 1": (result) => result.allFromThread1 === true,
      });
    }
  });

  describe('[Info-List] Test multiple threadIds', () => {
    authenticateWeb(data.teacher.login);

    const thread1Id = (data as any).threadId;
    const thread2Id = (data as any).thread2Id;
    const url = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=100&threadIds=${thread1Id}&threadIds=${thread2Id}`;
    const res = http.get(url, { headers: getHeaders() });

    check(res, {
      "Multiple threadIds query should succeed": (r) => r.status === 200,
    });

    const infos = JSON.parse(res.body as string);
    const hasThread1Info = infos.some((info: any) => info.id === (data as any).currentId);
    const hasThread2Info = infos.some((info: any) => info.id === (data as any).thread2InfoId);

    check({ hasThread1Info, hasThread2Info }, {
      "Multiple threadIds SHOULD return infos from thread 1": (result) => result.hasThread1Info === true,
      "Multiple threadIds SHOULD return infos from thread 2": (result) => result.hasThread2Info === true,
    });

    if (infos.length > 0) {
      const allFromCorrectThread = infos.every((info: any) =>
        info.threadId === parseInt(thread1Id) || info.threadId === parseInt(thread2Id)
      );
      check({ allFromCorrectThread }, {
        "All infos should belong to requested threads": (result) => result.allFromCorrectThread === true,
      });
    }
  });

  describe('[Info-List] Test without threadIds filter', () => {
    authenticateWeb(data.teacher.login);

    const url = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=100`;
    const res = http.get(url, { headers: getHeaders() });

    check(res, {
      "Query without threadIds should succeed": (r) => r.status === 200,
    });

    const infos = JSON.parse(res.body as string);
    check(infos, {
      "Query without threadIds returns an array": (list) => Array.isArray(list),
      "Query without threadIds should return results": (list) => list.length > 0,
    });

    const hasOurInfo = infos.some((info: any) => info.id === (data as any).currentId);
    check({ hasOurInfo }, {
      "Query without threadIds should include our published current info": (result) => result.hasOurInfo === true,
    });
  });

  // ============================================================
  // SECTION 3: Status filters
  // ============================================================

  describe('[Info-List] Test DRAFT status filter', () => {
    authenticateWeb(data.teacher.login);

    const threadId = (data as any).threadId;
    const url = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=100&status=DRAFT&threadIds=${threadId}`;
    const res = http.get(url, { headers: getHeaders() });

    check(res, {
      "DRAFT status query should succeed": (r) => r.status === 200,
    });

    const infos = JSON.parse(res.body as string);
    const hasDraft = infos.some((info: any) => info.id === (data as any).draftId);
    const hasPending = infos.some((info: any) => info.id === (data as any).pendingId);
    const hasPublished = infos.some((info: any) => info.id === (data as any).currentId);

    check({ hasDraft, hasPending, hasPublished }, {
      "DRAFT filter SHOULD return draft news": (result) => result.hasDraft === true,
      "DRAFT filter should NOT return pending news": (result) => result.hasPending === false,
      "DRAFT filter should NOT return published news": (result) => result.hasPublished === false,
    });
  });

  describe('[Info-List] Test PENDING status filter', () => {
    authenticateWeb(data.teacher.login);

    const threadId = (data as any).threadId;
    const url = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=100&status=PENDING&threadIds=${threadId}`;
    const res = http.get(url, { headers: getHeaders() });

    check(res, {
      "PENDING status query should succeed": (r) => r.status === 200,
    });

    const infos = JSON.parse(res.body as string);
    const hasPending = infos.some((info: any) => info.id === (data as any).pendingId);

    check({ hasPending }, {
      "PENDING filter SHOULD return pending news": (result) => result.hasPending === true,
    });
  });

  describe('[Info-List] Test multi-status filter', () => {
    authenticateWeb(data.teacher.login);

    const threadId = (data as any).threadId;
    const url = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=100&status=DRAFT&status=PENDING&threadIds=${threadId}`;
    const res = http.get(url, { headers: getHeaders() });

    check(res, {
      "Multi-status query should succeed": (r) => r.status === 200,
    });

    const infos = JSON.parse(res.body as string);
    const hasDraft = infos.some((info: any) => info.id === (data as any).draftId);
    const hasPending = infos.some((info: any) => info.id === (data as any).pendingId);
    const hasPublished = infos.some((info: any) => info.id === (data as any).currentId);

    check({ hasDraft, hasPending, hasPublished }, {
      "Multi-status SHOULD return draft news": (result) => result.hasDraft === true,
      "Multi-status SHOULD return pending news": (result) => result.hasPending === true,
      "Multi-status should NOT return published news": (result) => result.hasPublished === false,
    });
  });

  // ============================================================
  // SECTION 4: State filters
  // ============================================================

  describe('[Info-List] Test expired state filter', () => {
    authenticateWeb(data.teacher.login);

    const threadId = (data as any).threadId;
    const url = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=100&state=expired&threadIds=${threadId}`;
    const res = http.get(url, { headers: getHeaders() });

    check(res, {
      "Expired query should succeed": (r) => r.status === 200,
    });

    const infos = JSON.parse(res.body as string);
    const hasExpired = infos.some((info: any) => info.id === (data as any).expiredId);
    const hasIncoming = infos.some((info: any) => info.id === (data as any).incomingId);
    const hasCurrent = infos.some((info: any) => info.id === (data as any).currentId);

    check({ hasExpired, hasIncoming, hasCurrent }, {
      "Expired filter SHOULD return expired news": (result) => result.hasExpired === true,
      "Expired filter should NOT return incoming news": (result) => result.hasIncoming === false,
      "Expired filter should NOT return current news": (result) => result.hasCurrent === false,
    });

    if (infos.length > 0) {
      const allExpired = infos.every((info: any) => isExpired(info.expirationDate));
      check({ allExpired }, {
        "All returned infos should be expired": (result) => result.allExpired === true,
      });
    }
  });

  describe('[Info-List] Test incoming state filter', () => {
    authenticateWeb(data.teacher.login);

    const threadId = (data as any).threadId;
    const url = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=100&state=incoming&threadIds=${threadId}`;
    const res = http.get(url, { headers: getHeaders() });

    check(res, {
      "Incoming query should succeed": (r) => r.status === 200,
    });

    const infos = JSON.parse(res.body as string);
    const hasExpired = infos.some((info: any) => info.id === (data as any).expiredId);
    const hasIncoming = infos.some((info: any) => info.id === (data as any).incomingId);
    const hasCurrent = infos.some((info: any) => info.id === (data as any).currentId);

    check({ hasExpired, hasIncoming, hasCurrent }, {
      "Incoming filter should NOT return expired news": (result) => result.hasExpired === false,
      "Incoming filter SHOULD return incoming news": (result) => result.hasIncoming === true,
      "Incoming filter should NOT return current news": (result) => result.hasCurrent === false,
    });

    if (infos.length > 0) {
      const allIncoming = infos.every((info: any) => isIncoming(info.publicationDate));
      check({ allIncoming }, {
        "All returned infos should be incoming": (result) => result.allIncoming === true,
      });
    }
  });

  describe('[Info-List] Test multi-state filter', () => {
    authenticateWeb(data.teacher.login);

    const threadId = (data as any).threadId;
    const url = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=100&state=expired&state=incoming&threadIds=${threadId}`;
    const res = http.get(url, { headers: getHeaders() });

    check(res, {
      "Multi-state query should succeed": (r) => r.status === 200,
    });

    const infos = JSON.parse(res.body as string);
    const hasExpired = infos.some((info: any) => info.id === (data as any).expiredId);
    const hasIncoming = infos.some((info: any) => info.id === (data as any).incomingId);
    const hasCurrent = infos.some((info: any) => info.id === (data as any).currentId);

    check({ hasExpired, hasIncoming, hasCurrent }, {
      "Multi-state SHOULD return expired news": (result) => result.hasExpired === true,
      "Multi-state SHOULD return incoming news": (result) => result.hasIncoming === true,
      "Multi-state should NOT return current news": (result) => result.hasCurrent === false,
    });

    if (infos.length > 0) {
      const allValid = infos.every((info: any) =>
        isExpired(info.expirationDate) || isIncoming(info.publicationDate)
      );
      check({ allValid }, {
        "All returned infos should be expired OR incoming": (result) => result.allValid === true,
      });
    }
  });

  // ============================================================
  // SECTION 5: Combined filters
  // ============================================================

  describe('[Info-List] Test combined state and status filters', () => {
    authenticateWeb(data.teacher.login);

    const url = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=100&state=expired&status=PUBLISHED`;
    const res = http.get(url, { headers: getHeaders() });

    check(res, {
      "Combined filters should succeed": (r) => r.status === 200,
    });

    const infos = JSON.parse(res.body as string);
    check(infos, {
      "Combined filters return an array": (list) => Array.isArray(list),
    });

    if (infos.length > 0) {
      const allMatch = infos.every((info: any) =>
        info.status === 'PUBLISHED' && isExpired(info.expirationDate)
      );
      check({ allMatch }, {
        "All results should match combined filters": (result) => result.allMatch === true,
      });
    }
  });

  // ============================================================
  // SECTION 6: Invalid parameters
  // ============================================================

  describe('[Info-List] Test invalid parameters', () => {
    authenticateWeb(data.teacher.login);

    // Invalid page parameter
    const urlInvalidPage = `${rootUrl}/actualites/api/v1/infos?page=invalid&pageSize=10`;
    const resInvalidPage = http.get(urlInvalidPage, { headers: getHeaders() });
    check(resInvalidPage, {
      "Invalid page parameter should default to 0 and succeed": (r) => r.status === 200,
    });

    // Invalid pageSize parameter
    const urlInvalidPageSize = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=abc`;
    const resInvalidPageSize = http.get(urlInvalidPageSize, { headers: getHeaders() });
    check(resInvalidPageSize, {
      "Invalid pageSize parameter should default to 20 and succeed": (r) => r.status === 200,
    });

    const infos = JSON.parse(resInvalidPageSize.body as string);
    check(infos, {
      "Invalid pageSize should return at most DEFAULT_PAGE_SIZE items": (list) =>
        Array.isArray(list) && list.length <= 20,
    });

    // Invalid threadId parameter
    const urlInvalidThreadId = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=10&threadIds=invalid`;
    const resInvalidThreadId = http.get(urlInvalidThreadId, { headers: getHeaders() });
    check(resInvalidThreadId, {
      "Invalid threadId should be skipped and query succeeds": (r) => r.status === 200,
    });

    // Invalid status parameter
    const urlInvalidStatus = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=10&status=INVALID`;
    const resInvalidStatus = http.get(urlInvalidStatus, { headers: getHeaders() });
    check(resInvalidStatus, {
      "Invalid status should be ignored and query succeeds": (r) => r.status === 200,
    });

    // Invalid state parameter
    const urlInvalidState = `${rootUrl}/actualites/api/v1/infos?page=0&pageSize=10&state=invalid`;
    const resInvalidState = http.get(urlInvalidState, { headers: getHeaders() });
    check(resInvalidState, {
      "Invalid state parameter should be ignored and query succeeds": (r) => r.status === 200,
    });

    const infosInvalidState = JSON.parse(resInvalidState.body as string);
    check(infosInvalidState, {
      "Invalid state returns results": (list) => Array.isArray(list),
    });
  });
}
