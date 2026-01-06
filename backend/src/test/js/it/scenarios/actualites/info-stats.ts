import { describe } from "https://jslib.k6.io/k6chaijs/4.3.4.0/index.js";
import {
  authenticateWeb,
  getUsersOfSchool,
  initStructure,
  Session,
  Structure,
  Role,
  getTeacherRole,
  createAndSetRole,
  linkRoleToUsers,
  getHeaders,
} from '../../../node_modules/edifice-k6-commons/dist/index.js';
import {
  createThreadOrFail,
  Identifier as ThreadIdentifier,
  shareThreadOrFail,
  threadContributorRights,
  threadPublisherRights,
} from "../../../utils/_thread-utils.ts";
import {
  createInfoOrFail,
  createPublishedInfoOrFail,
  getStats,
  getThreadStats,
  formatDate,
} from "../../../utils/_info-utils.ts";
import { check } from "k6";
import http from "k6/http";
import { ShareTargetType } from "../../../utils/_shares_utils.ts";

const maxDuration = __ENV.MAX_DURATION || "5m";
const schoolName = __ENV.DATA_SCHOOL_NAME || `Info stats tests ${Math.random().toString(36).substring(7)}`;
const gracefulStop = parseInt(__ENV.GRACEFUL_STOP || "2s");
const rootUrl = __ENV.ROOT_URL;
const statsUrl = `${rootUrl}/actualites/api/v1/infos/stats`;

export const options = {
  setupTimeout: "1h",
  thresholds: {
    checks: ["rate == 1.00"],
  },
  scenarios: {
    testInfoStats: {
      executor: "per-vu-iterations",
      exec: "testInfoStats",
      vus: 1,
      maxDuration: maxDuration,
      gracefulStop,
    },
  },
};

type InitData = {
  head: Structure;
  teacher: any;
  teacher2: any;
  mainThreadId: string;
}

export function setup() {
  let head: Structure | null = null;
  let teacher: any = null;
  let teacher2: any = null;

  describe("[Info-Stats-Init] Initialize test data", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    head = initStructure(`${schoolName} - Head`)
    const teacherProfileGroup = getTeacherRole(head);
    const role: Role = createAndSetRole("Actualites");
    linkRoleToUsers(head, role, [teacherProfileGroup.name]);

    const headUsers = getUsersOfSchool(head);
    const teachers = headUsers.filter((u: any) => u.type === 'Teacher');
    if (teachers.length < 2) {
      throw new Error("Need at least 2 teachers for permission tests");
    }

    teacher = teachers[0];
    teacher2 = teachers[1];

    // Ensure userId is set (may be stored as 'id')
    if (!teacher.userId && teacher.id) teacher.userId = teacher.id;
    if (!teacher2.userId && teacher2.id) teacher2.userId = teacher2.id;

    console.log("Selected teacher 1 for all tests: " + teacher.login);
    console.log("Selected teacher 2 for permission tests: " + teacher2.login);
  });

  return { head, teacher, teacher2, mainThreadId: "" };
}

export function testInfoStats(data: InitData) {
  const seed = Math.random().toString(36).substring(7);

  // ========================================
  // SETUP: Create main test thread
  // ========================================

  describe('[Info-Stats] Setup - Create main thread with various infos', () => {
    authenticateWeb(data.teacher.login);

    const thread = createThreadOrFail(`Thread stats ${seed}`, data.head.id);
    data.mainThreadId = thread.id as string;
    console.log(`Thread id: ${thread.id}`);

    // 2 EXPIRED published infos
    createPublishedInfoOrFail({
      title: `Expired 1 ${seed}`,
      content: `Content`,
      thread_id: parseInt(thread.id as string),
      status: 3,
      publication_date: "2020-01-01T00:00:00Z",
      expiration_date: "2020-06-30T00:00:00Z",
    } as any);

    createPublishedInfoOrFail({
      title: `Expired 2 ${seed}`,
      content: `Content`,
      thread_id: parseInt(thread.id as string),
      status: 3,
      publication_date: "2020-01-01T00:00:00Z",
      expiration_date: "2020-12-31T00:00:00Z",
    } as any);

    // 2 INCOMING published infos
    createPublishedInfoOrFail({
      title: `Incoming 1 ${seed}`,
      content: `Content`,
      thread_id: parseInt(thread.id as string),
      status: 3,
      publication_date: "2030-01-01T00:00:00Z",
      expiration_date: "2030-06-30T00:00:00Z",
    } as any);

    createPublishedInfoOrFail({
      title: `Incoming 2 ${seed}`,
      content: `Content`,
      thread_id: parseInt(thread.id as string),
      status: 3,
      publication_date: "2030-07-01T00:00:00Z",
      expiration_date: "2030-12-31T00:00:00Z",
    } as any);

    // 1 CURRENT published info
    createPublishedInfoOrFail({
      title: `Current ${seed}`,
      content: `Content`,
      thread_id: parseInt(thread.id as string),
      status: 3,
      publication_date: "2020-01-01T00:00:00Z",
      expiration_date: "2035-12-31T00:00:00Z",
    } as any);

    // 2 DRAFT infos (should NOT be counted as expired/incoming)
    createInfoOrFail({
      title: `Draft 1 ${seed}`,
      content: `Content`,
      thread_id: parseInt(thread.id as string),
      status: 1,
    } as any);

    createInfoOrFail({
      title: `Draft 2 ${seed}`,
      content: `Content`,
      thread_id: parseInt(thread.id as string),
      status: 1,
    } as any);
  });

  // ========================================
  // CATEGORY: Basic structure and counts
  // ========================================

  describe('[Info-Stats] Basic stats structure and counts', () => {
    authenticateWeb(data.teacher.login);

    const stats = getStats(statsUrl);
    check(stats, {
      "Stats should have threads array": (s) => Array.isArray(s.threads),
    });

    const threadStats = stats.threads.find((t: any) => t.id === parseInt(data.mainThreadId));
    check(threadStats, {
      "Our thread should be in stats": (t) => t !== undefined,
      "Thread should have id": (t) => t && typeof t.id === "number",
      "Thread should have infosCount": (t) => t && typeof t.infosCount === "number",
      "Thread should have status object": (t) => t && typeof t.status === "object",
      "Thread should have expiredCount": (t) => t && typeof t.expiredCount === "number",
      "Thread should have incomingCount": (t) => t && typeof t.incomingCount === "number",
      "expiredCount should be 2": (t) => t.expiredCount === 2,
      "incomingCount should be 2": (t) => t.incomingCount === 2,
      "Total infosCount should be 7 (5 published + 2 draft)": (t) => t.infosCount === 7,
      "expiredCount should still be 2 (only PUBLISHED)": (t) => t.expiredCount === 2,
      "incomingCount should still be 2 (only PUBLISHED)": (t) => t.incomingCount === 2,
    });

    check(threadStats.status, {
      "Status should have PUBLISHED count": (s) => typeof s.PUBLISHED === "number",
      "Status should have DRAFT count of 2": (s) => s.DRAFT === 2,
      "PUBLISHED count should be 1 (only current, not expired/incoming)": (s) => s.PUBLISHED === 1,
    });

    console.log(`Thread stats: ${JSON.stringify(threadStats)}`);
  });

  // ========================================
  // CATEGORY: Temporal tests (NULL dates, edge cases)
  // ========================================

  describe('[Info-Stats] NULL expiration_date handling', () => {
    authenticateWeb(data.teacher.login);

    createPublishedInfoOrFail({
      title: `NULL exp ${seed}`,
      content: `Content`,
      thread_id: parseInt(data.mainThreadId),
      status: 3,
      publication_date: "2020-01-01T00:00:00Z",
    } as any);

    const threadStats = getThreadStats(statsUrl, data.mainThreadId);
    check(threadStats, {
      "expiredCount should still be 2 after adding NULL expiration": (t) => t.expiredCount === 2,
    });
  });

  describe('[Info-Stats] NULL publication_date handling', () => {
    authenticateWeb(data.teacher.login);

    createPublishedInfoOrFail({
      title: `NULL pub ${seed}`,
      content: `Content`,
      thread_id: parseInt(data.mainThreadId),
      status: 3,
      expiration_date: "2035-12-31T00:00:00Z",
    } as any);

    const threadStats = getThreadStats(statsUrl, data.mainThreadId);
    check(threadStats, {
      "incomingCount should still be 2 after adding NULL publication": (t) => t.incomingCount === 2,
    });
  });

  describe('[Info-Stats] Temporal edge cases (dates near NOW)', () => {
    authenticateWeb(data.teacher.login);

    const now = new Date();
    const oneSecondAgo = new Date(now.getTime() - 1000);
    const fiveSecondsLater = new Date(now.getTime() + 5000);

    createPublishedInfoOrFail({
      title: `Expiring now ${seed}`,
      content: `Content`,
      thread_id: parseInt(data.mainThreadId),
      status: 3,
      publication_date: "2020-01-01T00:00:00Z",
      expiration_date: formatDate(oneSecondAgo),
    } as any);

    createPublishedInfoOrFail({
      title: `Publishing now ${seed}`,
      content: `Content`,
      thread_id: parseInt(data.mainThreadId),
      status: 3,
      publication_date: formatDate(fiveSecondsLater),
      expiration_date: "2035-12-31T00:00:00Z",
    } as any);

    const threadStats = getThreadStats(statsUrl, data.mainThreadId);
    check(threadStats, {
      "expiredCount should have increased": (t) => t.expiredCount >= 3,
      "incomingCount should have increased": (t) => t.incomingCount >= 3,
    });
  });

  // ========================================
  // CATEGORY: Status tests
  // ========================================

  describe('[Info-Stats] PENDING status counted', () => {
    authenticateWeb(data.teacher.login);

    createInfoOrFail({
      title: `Pending info ${seed}`,
      content: `Content`,
      thread_id: parseInt(data.mainThreadId),
      status: 2,
    } as any);

    const threadStats = getThreadStats(statsUrl, data.mainThreadId);
    check(threadStats.status, {
      "Status should have PENDING count": (s) => typeof s.PENDING === "number",
      "PENDING count should be at least 1": (s) => s.PENDING >= 1,
    });
  });

  describe('[Info-Stats] Thread without PUBLISHED infos', () => {
    authenticateWeb(data.teacher.login);

    const thread = createThreadOrFail(`Thread no published ${seed}`, data.head.id);

    createInfoOrFail({
      title: `Draft 1 ${seed}`,
      content: `Content`,
      thread_id: parseInt(thread.id as string),
      status: 1,
    } as any);

    createInfoOrFail({
      title: `Pending 1 ${seed}`,
      content: `Content`,
      thread_id: parseInt(thread.id as string),
      status: 2,
    } as any);

    const threadStats = getThreadStats(statsUrl, thread.id as string);
    check(threadStats, {
      "Thread should have infosCount = 2": (t) => t.infosCount === 2,
      "Thread should have expiredCount = 0": (t) => t.expiredCount === 0,
      "Thread should have incomingCount = 0": (t) => t.incomingCount === 0,
    });

    check(threadStats.status, {
      "Status should have DRAFT": (s) => s.DRAFT >= 1,
      "Status should have PENDING": (s) => s.PENDING >= 1,
      "Status should not have PUBLISHED": (s) => !s.PUBLISHED || s.PUBLISHED === 0,
    });
  });

  describe('[Info-Stats] All statuses combined in one thread', () => {
    authenticateWeb(data.teacher.login);

    const thread = createThreadOrFail(`Thread all statuses ${seed}`, data.head.id);
    const tid = parseInt(thread.id as string);

    createInfoOrFail({ title: `Draft ${seed}`, content: `Content`, thread_id: tid, status: 1 } as any);
    createInfoOrFail({ title: `Pending ${seed}`, content: `Content`, thread_id: tid, status: 2 } as any);

    createPublishedInfoOrFail({
      title: `Expired ${seed}`,
      content: `Content`,
      thread_id: tid,
      status: 3,
      publication_date: "2020-01-01T00:00:00Z",
      expiration_date: "2020-12-31T00:00:00Z",
    } as any);

    createPublishedInfoOrFail({
      title: `Incoming ${seed}`,
      content: `Content`,
      thread_id: tid,
      status: 3,
      publication_date: "2030-01-01T00:00:00Z",
      expiration_date: "2030-12-31T00:00:00Z",
    } as any);

    createPublishedInfoOrFail({
      title: `Current ${seed}`,
      content: `Content`,
      thread_id: tid,
      status: 3,
      publication_date: "2020-01-01T00:00:00Z",
      expiration_date: "2035-12-31T00:00:00Z",
    } as any);

    const threadStats = getThreadStats(statsUrl, tid);
    check(threadStats, {
      "Thread should have infosCount = 5": (t) => t.infosCount === 5,
      "Thread should have expiredCount = 1": (t) => t.expiredCount === 1,
      "Thread should have incomingCount = 1": (t) => t.incomingCount === 1,
    });

    check(threadStats.status, {
      "Status should have DRAFT = 1": (s) => s.DRAFT === 1,
      "Status should have PENDING = 1": (s) => s.PENDING === 1,
      "Status should have PUBLISHED = 1 (only current, not expired/incoming)": (s) => s.PUBLISHED === 1,
    });
  });

  describe('[Info-Stats] TRASH status counted', () => {
    authenticateWeb(data.teacher.login);

    const thread = createThreadOrFail(`Thread with trash ${seed}`, data.head.id);

    const draftInfo = createInfoOrFail({
      title: `Info to trash ${seed}`,
      content: `Content`,
      thread_id: parseInt(thread.id as string),
      status: 1,
    } as any);

    const updateRes = http.put(
      `${rootUrl}/actualites/api/v1/infos/${draftInfo.id}`,
      JSON.stringify({
        status: 0,
        title: `Info to trash ${seed}`,
        content: `Content`,
      }),
      { headers: getHeaders() }
    );

    check(updateRes, {
      "Update to TRASH should succeed": (r) => r.status === 200,
    });

    const threadStats = getThreadStats(statsUrl, thread.id as string);
    check(threadStats, {
      "Status should have TRASH count": (s) => s && typeof s.status.TRASH === "number",
      "TRASH count should be 1": (s) => s && s.status.TRASH === 1,
    });
  });

  // ========================================
  // CATEGORY: Multiple threads
  // ========================================

  describe('[Info-Stats] Multiple threads', () => {
    authenticateWeb(data.teacher.login);

    const thread2 = createThreadOrFail(`Second thread ${seed}`, data.head.id);

    createPublishedInfoOrFail({
      title: `Expired in thread 2 ${seed}`,
      content: `Content`,
      thread_id: parseInt(thread2.id as string),
      status: 3,
      publication_date: "2020-01-01T00:00:00Z",
      expiration_date: "2020-12-31T00:00:00Z",
    } as any);

    createInfoOrFail({
      title: `Draft in thread 2 ${seed}`,
      content: `Content`,
      thread_id: parseInt(thread2.id as string),
      status: 1,
    } as any);

    const stats = getStats(statsUrl);
    const thread1Stats = stats.threads.find((t: any) => t.id === parseInt(data.mainThreadId));
    const thread2Stats = stats.threads.find((t: any) => t.id === parseInt(thread2.id as string));

    check({ thread1Stats, thread2Stats }, {
      "Stats should contain first thread": (d) => d.thread1Stats !== undefined,
      "Stats should contain second thread": (d) => d.thread2Stats !== undefined,
      "Second thread should have correct expiredCount": (d) => d.thread2Stats.expiredCount === 1,
      "Second thread should have correct infosCount": (d) => d.thread2Stats.infosCount === 2,
    });
  });

  describe('[Info-Stats] Empty thread should NOT appear', () => {
    authenticateWeb(data.teacher.login);

    const emptyThread = createThreadOrFail(`Empty thread ${seed}`, data.head.id);

    const stats = getStats(statsUrl);
    const emptyThreadStats = stats.threads.find((t: any) => t.id === parseInt(emptyThread.id as string));

    check({ emptyThreadStats }, {
      "Empty thread should NOT appear in stats": (d) => d.emptyThreadStats === undefined,
    });
  });

  // ========================================
  // CATEGORY: Permissions
  // ========================================

  describe('[Info-Stats] Thread shared with user appears', () => {
    authenticateWeb(data.teacher.login);

    const sharedThread = createThreadOrFail(`Shared thread ${seed}`, data.head.id);

    createPublishedInfoOrFail({
      title: `Info in shared thread ${seed}`,
      content: `Content`,
      thread_id: parseInt(sharedThread.id as string),
      status: 3,
      publication_date: "2020-01-01T00:00:00Z",
      expiration_date: "2035-12-31T00:00:00Z",
    } as any);

    const allRights = [...threadContributorRights, ...threadPublisherRights];
    shareThreadOrFail(sharedThread.id as string, [data.teacher2.userId], allRights, ShareTargetType.USER);

    authenticateWeb(data.teacher2.login);

    const sharedThreadStats = getThreadStats(statsUrl, sharedThread.id as string);
    check(sharedThreadStats, {
      "Shared thread should appear for teacher2": (t) => t !== undefined,
      "Shared thread should have infosCount = 1": (t) => t && t.infosCount === 1,
    });
  });

  describe('[Info-Stats] Unshared thread does NOT appear', () => {
    authenticateWeb(data.teacher.login);

    const privateThread = createThreadOrFail(`Private thread ${seed}`, data.head.id);

    createPublishedInfoOrFail({
      title: `Info in private thread ${seed}`,
      content: `Content`,
      thread_id: parseInt(privateThread.id as string),
      status: 3,
      publication_date: "2020-01-01T00:00:00Z",
      expiration_date: "2035-12-31T00:00:00Z",
    } as any);

    authenticateWeb(data.teacher2.login);

    const stats = getStats(statsUrl);
    const privateThreadStats = stats.threads.find((t: any) => t.id === parseInt(privateThread.id as string));

    check({ privateThreadStats }, {
      "Private thread should NOT appear for teacher2": (d) => d.privateThreadStats === undefined,
    });
  });

  describe('[Info-Stats] Directly shared info makes thread appear', () => {
    authenticateWeb(data.teacher.login);

    const thread = createThreadOrFail(`Thread with shared info ${seed}`, data.head.id);

    const info = createPublishedInfoOrFail({
      title: `Shared info ${seed}`,
      content: `Content`,
      thread_id: parseInt(thread.id as string),
      status: 3,
      publication_date: "2020-01-01T00:00:00Z",
      expiration_date: "2035-12-31T00:00:00Z",
    } as any);

    const shareBody = {
      users: { [data.teacher2.userId]: ["net-atos-entng-actualites-controllers-InfoController|getInfo"] },
      groups: {},
      bookmark: {}
    };

    const shareRes = http.put(
      `${rootUrl}/actualites/api/v1/infos/${info.id}/shares`,
      JSON.stringify(shareBody),
      { headers: getHeaders() }
    );

    check(shareRes, {
      "Info sharing should succeed": (r) => r.status < 300,
    });

    authenticateWeb(data.teacher2.login);

    const threadStats = getThreadStats(statsUrl, thread.id as string);
    check(threadStats, {
      "Thread with shared info should appear for teacher2": (t) => t !== undefined,
      "Thread should have infosCount = 1": (t) => t && t.infosCount === 1,
    });
  });
}
