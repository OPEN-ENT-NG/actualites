import { describe } from "https://jslib.k6.io/k6chaijs/4.3.4.0/index.js";

import {
  authenticateWeb,
  getUsersOfSchool,
  addCommRuleToGroup,
  attachStructureAsChild,
  initStructure,
  getRandomUserWithProfile,
  Session,
  Structure,
  Role,
  getTeacherRole,
  getRolesOfStructure,
  createAndSetRole,
  linkRoleToUsers,
  getParentRole
} from '../../../node_modules/edifice-k6-commons/dist/index.js';
import {
  createThreadOrFail,
  Identifier as ThreadIdentifier, threadContributorRights, threadPublisherRights,
} from "./_thread-utils.ts";
import {
  createInfoOrFail,
  createPublishedInfoOrFail,
  getInfoById,
  Info,
  InfoResponse, Identifier, updateInfo, updateInfoOrFail,
} from "./_info-utils.ts";
import { check } from "k6";
import { addUserSharesInfos, shareThreadsOrFail } from "./_shares_utils.ts";

const maxDuration = __ENV.MAX_DURATION || "5m";
const schoolName = __ENV.DATA_SCHOOL_NAME || "Info Update";
const gracefulStop = parseInt(__ENV.GRACEFUL_STOP || "2s");

export const options = {
  setupTimeout: "1h",
  thresholds: {
    checks: ["rate == 1.00"],
  },
  scenarios: {
    testInfoUpdateOwner: {
      executor: "per-vu-iterations",
      exec: "testInfoUpdateOwner",
      vus: 1,
      maxDuration: maxDuration,
      gracefulStop,
    },
    testInfoUpdateContributor: {
      executor: "per-vu-iterations",
      exec: "testInfoUpdateContributor",
      vus: 1,
      maxDuration: maxDuration,
      gracefulStop,
    },
    testInfoUpdatePublisher: {
      executor: "per-vu-iterations",
      exec: "testInfoUpdatePublisher",
      vus: 1,
      maxDuration: maxDuration,
      gracefulStop,
    },
    testInfoUpdateOwnerTransition: {
      executor: "per-vu-iterations",
      exec: "testInfoUpdateOwnerTransition",
      vus: 1,
      maxDuration: maxDuration,
      gracefulStop,
    },
  },
};

type InitData = {
  head: Structure;
  structures: Structure[];
}

export function setup() {
  let head: Structure | null = null;
  const structures: Structure[] = [];
  describe("[Info-Edition-Init] Initialize data", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    head = initStructure(`${schoolName} - Head`)
    const teacherProfileGroup = getTeacherRole(head);
    const attachedStructuresGroups: string[] = []
    const school = initStructure(`${schoolName} - School`);
    structures.push(school);
    attachStructureAsChild(head, school)
    const parentRole = getParentRole(school);
    const schoolProfileGroup = getRolesOfStructure(school.id);
    attachedStructuresGroups.push(...schoolProfileGroup.map((s) => s.id));

    for (let group of attachedStructuresGroups) {
      addCommRuleToGroup(group, [teacherProfileGroup.id]);
    }
    const role: Role = createAndSetRole("Actualites");

    linkRoleToUsers(head, role, [teacherProfileGroup.name]);
    linkRoleToUsers(school, role, [parentRole.name]);
  });
  return { head, structures };
}

export function testInfoUpdateOwner(data: InitData) {

  // ============================================================
  // TESTS DE MAJ AS OWNER
  // ============================================================

  describe('[Info] Test updating an info with DRAFT status as owner', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    // Create an info with DRAFT status
    console.log("Creating an info with DRAFT status");
    const infoData: Info = {
      title: `Draft info ${seed}`,
      content: `This is a draft content ${seed}`,
      status: 1, // DRAFT
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    const uInfo: Info = {
      title: `Draft update info ${seed}`,
      content: `This is a update draft content ${seed}`,
      status: 1,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp, { "Update of draft info as owner should be successful": (r) => r.status === 200 });

    const retrievedInfo: InfoResponse = getInfoById(createResp.id);

    check(retrievedInfo, {
      "Retrieved updated info has correct title": (info) => info.title === uInfo.title,
      "Retrieved updated info has DRAFT status": (info) => info.status === 'DRAFT',
      "Retrieved updated info has correct thread_id": (info) => info.thread?.id === uInfo.thread_id,
    });

  });


  describe('[Info] Test updating an info with all optional fields', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for complete info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    // Create an info with all optional fields
    console.log("Creating an info with all optional fields");
    const infoData: Info = {
      title: `Complete info ${seed}`,
      content: `<p>This is a <strong>rich HTML</strong> content ${seed}</p>`,
      status: 1, // DRAFT
      thread_id: parseInt(thread.id as string)
    };

    const createdInfo = createInfoOrFail(infoData);

    console.log(`Info of id ${createdInfo.id} created`);

    const uInfo: Info = {
      title: `Draft update info ${seed}`,
      content: `<p>This is a update draft content ${seed}</p>`,
      status: 1,
      thread_id: parseInt(thread.id as string),
      publication_date: "2025-10-25T00:00:00.000",
      expiration_date: "2025-12-31T00:00:00.000",
      is_headline: true
    }

    const uResp = updateInfo(createdInfo.id, uInfo);

    check(uResp, { "Update of draft info as owner should be successful": (r) => r.status === 200 });

    const retrievedInfo: InfoResponse = getInfoById(createdInfo.id);

    check(retrievedInfo, {
      "Retrieved info has correct title": (info) => info.title === uInfo.title,
      "Retrieved info has correct content": (info) => info.content === uInfo.content,
      "Retrieved info has correct status": (info) => info.status === 'DRAFT',
      "Retrieved info has correct thread_id": (info) => info.thread?.id === uInfo.thread_id,
      "Retrieved info has publication_date": (info) => info.publicationDate !== undefined && info.publicationDate.includes(uInfo.publication_date || ''),
      "Retrieved info has expiration_date": (info) => info.expirationDate !== undefined && info.expirationDate.includes(uInfo.expiration_date || ''),
      "Retrieved info has is_headline": (info) => info.headline,
    });
  });

  describe('[Info] Test updating an info with PENDING status as owner', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    // Create an info with DRAFT status
    console.log("Creating an info with PENDING status");
    const infoData: Info = {
      title: `Pending info ${seed}`,
      content: `This is a pending content ${seed}`,
      status: 2, // PENDING
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    const uInfo: Info = {
      title: `Pending update info ${seed}`,
      content: `This is a update pending content ${seed}`,
      status: 2,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp, { "Update of pending info as owner should be successful": (r) => r.status === 200 });

    const retrievedInfo: InfoResponse = getInfoById(createResp.id);
    console.log(retrievedInfo);

    check(retrievedInfo, {
      "Retrieved updated info has correct title": (info) => info.title === uInfo.title,
      "Retrieved updated info has pending status": (info) => info.status === 'PENDING',
      "Retrieved updated info has correct thread_id": (info) => info.thread?.id === uInfo.thread_id,
    });
  });

  describe('[Info] Test updating a PUBLISHED info as owner', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for published info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    // Create a published info directly
    console.log("Creating a PUBLISHED info");
    const infoData = {
      title: `Published info ${seed}`,
      content: `This is a published content ${seed}`,
      thread_id: parseInt(thread.id as string),
      status: 3
    };

    const createResp: Identifier = createPublishedInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    const uInfo: Info = {
      title: `Published update info ${seed}`,
      content: `This is an update published content ${seed}`,
      status: 3,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp, { "Update of published info as owner should be successful": (r) => r.status === 200 });

    const retrievedInfo: InfoResponse = getInfoById(createResp.id);
    console.log(retrievedInfo);

    check(retrievedInfo, {
      "Retrieved updated info has correct title": (info) => info.title === uInfo.title,
      "Retrieved updated info has publish status": (info) => info.status === 'PUBLISHED',
      "Retrieved updated info has correct thread_id": (info) => info.thread?.id === uInfo.thread_id,
    });
  });


  describe('[Info] Test updating an info with DRAFT status as thread owner should failed', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({
      users: {},
      groups: {},
      sharedBookmarks: {}
    }, headTeacher2.id, threadContributorRights);

    shareThreadsOrFail(thread.id, shares);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    // Create an info with DRAFT status
    console.log("Creating an info with DRAFT status");
    const infoData: Info = {
      title: `Draft info ${seed}`,
      content: `This is a draft content ${seed}`,
      status: 1, // DRAFT
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    const uInfo: Info = {
      title: `Draft update info ${seed}`,
      content: `This is a update draft content ${seed}`,
      status: 1,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp, { "Update of draft info as thread owner should failed": (r) => r.status === 401 });
  });

  describe('[Info] Test updating an info with PENDING status as thread owner', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({
      users: {},
      groups: {},
      sharedBookmarks: {}
    }, headTeacher2.id, threadContributorRights);

    shareThreadsOrFail(thread.id, shares);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    // Create an info with PENDING status
    console.log("Creating an info with PENDING status");
    const infoData: Info = {
      title: `Pending info ${seed}`,
      content: `This is a pending content ${seed}`,
      status: 2, // PENDING
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    authenticateWeb(headTeacher.login);

    const uInfo: Info = {
      title: `Pending update info ${seed}`,
      content: `This is a update pending content ${seed}`,
      status: 2,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp, { "Update of pending info as thread owner should be successful": (r) => r.status === 200 });

    const retrievedInfo: InfoResponse = getInfoById(createResp.id);
    console.log(retrievedInfo);

    check(retrievedInfo, {
      "Retrieved updated info has correct title": (info) => info.title === uInfo.title,
      "Retrieved updated info has pending status": (info) => info.status === 'PENDING',
      "Retrieved updated info has correct thread_id": (info) => info.thread?.id === uInfo.thread_id,
    });
  });

  describe('[Info] Test updating a PUBLISHED info as thread owner', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for published info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({
      users: {},
      groups: {},
      sharedBookmarks: {}
    }, headTeacher2.id, [...threadContributorRights, ...threadPublisherRights]);

    shareThreadsOrFail(thread.id, shares);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    // Create a published info directly
    console.log("Creating a PUBLISHED info");
    const infoData = {
      title: `Published info ${seed}`,
      content: `This is a published content ${seed}`,
      thread_id: parseInt(thread.id as string),
      status: 3
    };

    const createResp: Identifier = createPublishedInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    const uInfo: Info = {
      title: `Published update info ${seed}`,
      content: `This is an update published content ${seed}`,
      status: 3,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp, { "Update of published info as thread owner should be successful": (r) => r.status === 200 });

    const retrievedInfo: InfoResponse = getInfoById(createResp.id);
    console.log(retrievedInfo);

    check(retrievedInfo, {
      "Retrieved updated info has correct title": (info) => info.title === uInfo.title,
      "Retrieved updated info has publish status": (info) => info.status === 'PUBLISHED',
      "Retrieved updated info has correct thread_id": (info) => info.thread?.id === uInfo.thread_id,
    });
  });
};

export function testInfoUpdateContributor(data: InitData) {

  // ============================================================
  // TESTS DE CAS LIMITS DE DROITS - TRANSITIONS / CONTRIBUTOR
  // ============================================================

  describe('[Info] Test updating from PENDING to DRAFT as CONTRIBUTOR should not be successful', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({
      users: {},
      groups: {},
      sharedBookmarks: {}
    }, headTeacher2.id, threadContributorRights);

    shareThreadsOrFail(thread.id, shares);

    // Create an info with PENDING status
    console.log("Creating an info with PENDING status");
    const infoData: Info = {
      title: `Pending info ${seed}`,
      content: `This is a pending content ${seed}`,
      status: 2, // PENDING
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    const uInfo: Info = {
      title: `Draft update info ${seed}`,
      content: `This is a update draft content ${seed}`,
      status: 1,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp, { "Update of pending info to draft as contributor should not be successful": (r) => r.status === 401 });
  });

  describe('[Info] Test updating from PUBLISHED to DRAFT as CONTRIBUTOR should not be OK', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({
      users: {},
      groups: {},
      sharedBookmarks: {}
    }, headTeacher2.id, threadContributorRights);

    shareThreadsOrFail(thread.id, shares);

    // Create an info with PUBLISHED status
    console.log("Creating an info with PUBLISHED status");
    const infoData: Info = {
      title: `Published info ${seed}`,
      content: `This is a publish content ${seed}`,
      status: 3, // PUBLISHED
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createPublishedInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    const uInfo: Info = {
      title: `Draft update info ${seed}`,
      content: `This is a update draft content ${seed}`,
      status: 1,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp, { "Update of published info to draft as contributor should not be successful": (r) => r.status === 401 });
  });

  describe('[Info] Test updating from PUBLISHED to PENDING as CONTRIBUTOR should not be OK', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({
      users: {},
      groups: {},
      sharedBookmarks: {}
    }, headTeacher2.id, threadContributorRights);

    shareThreadsOrFail(thread.id, shares);

    // Create an info with PUBLISHED status
    console.log("Creating an info with PUBLISHED status");
    const infoData: Info = {
      title: `Published info ${seed}`,
      content: `This is a publish content ${seed}`,
      status: 3, // PUBLISHED
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createPublishedInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    const uInfo: Info = {
      title: `Pending update info ${seed}`,
      content: `This is a update PENDING content ${seed}`,
      status: 2,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp, { "Update of published info to pending as contributor should not be successful": (r) => r.status === 401 });
  });


  describe('[Info] Test updating from DRAFT to PENDING as CONTRIBUTOR should not be OK', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({
      users: {},
      groups: {},
      sharedBookmarks: {}
    }, headTeacher2.id, threadContributorRights);

    shareThreadsOrFail(thread.id, shares);

    // Create an info with PUBLISHED status
    console.log("Creating an info with DRAFT status");
    const infoData: Info = {
      title: `Draft info ${seed}`,
      content: `This is a draft content ${seed}`,
      status: 1, // DRAFT
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createPublishedInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    const uInfo: Info = {
      title: `Pending update info ${seed}`,
      content: `This is a update PENDING content ${seed}`,
      status: 2,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp, { "Update of draft info to pending as contributor should not be successful": (r) => r.status === 401 });
  });


  describe('[Info] Test updating from DRAFT to PUBLISHED as CONTRIBUTOR should not be OK', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({
      users: {},
      groups: {},
      sharedBookmarks: {}
    }, headTeacher2.id, threadContributorRights);

    shareThreadsOrFail(thread.id, shares);

    // Create an info with PUBLISHED status
    console.log("Creating an info with DRAFT status");
    const infoData: Info = {
      title: `Draft info ${seed}`,
      content: `This is a draft content ${seed}`,
      status: 1, // DRAFT
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createPublishedInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    const uInfo: Info = {
      title: `Published update info ${seed}`,
      content: `This is a update PUBLISHED content ${seed}`,
      status: 3,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp, { "Update of draft info to published as contributor should not be successful": (r) => r.status === 401 });
  });

};

export function testInfoUpdatePublisher(data: InitData) {
  // ============================================================
  // TESTS DE CAS LIMITS DE DROITS - TRANSITIONS / PUBLISHER (les publishers ont également les droits contributeurs)
  // => test des cas non passant en contributeur
  // ============================================================


  describe('[Info] Test updating from PUBLISHED to DRAFT as PUBLISHER should be OK', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({ users: {}, groups: {}, sharedBookmarks: {} },
      headTeacher2.id, [...threadContributorRights, ...threadPublisherRights]);

    shareThreadsOrFail(thread.id, shares);

    // Create an info with PUBLISHED status
    console.log("Creating an info with PUBLISHED status");
    const infoData: Info = {
      title: `Published info ${seed}`,
      content: `This is a publish content ${seed}`,
      status: 3, // PUBLISHED
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createPublishedInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    const uInfo: Info = {
      title: `Draft update info ${seed}`,
      content: `This is a update draft content ${seed}`,
      status: 1,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp, { "Update of published info to draft as publisher should be successful": (r) => r.status === 200 });
  });

  describe('[Info] Test updating from PUBLISHED to PENDING as PUBLISHER should be OK', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({ users: {}, groups: {}, sharedBookmarks: {} }, headTeacher2.id,
      [...threadContributorRights, ...threadPublisherRights]);

    shareThreadsOrFail(thread.id, shares);

    // Create an info with PUBLISHED status
    console.log("Creating an info with PUBLISHED status");
    const infoData: Info = {
      title: `Published info ${seed}`,
      content: `This is a publish content ${seed}`,
      status: 3, // PUBLISHED
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createPublishedInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    const uInfo: Info = {
      title: `Pending update info ${seed}`,
      content: `This is a update PENDING content ${seed}`,
      status: 2,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp, { "Update of published info to pending as publisher should be successful": (r) => r.status === 200 });
  });


  describe('[Info] Test updating from DRAFT to PENDING as PUBLISHER should not be OK', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({ users: {}, groups: {}, sharedBookmarks: {} }, headTeacher2.id,
      [...threadContributorRights, ...threadPublisherRights]);

    shareThreadsOrFail(thread.id, shares);

    // Create an info with PUBLISHED status
    console.log("Creating an info with DRAFT status");
    const infoData: Info = {
      title: `Draft info ${seed}`,
      content: `This is a draft content ${seed}`,
      status: 1, // DRAFT
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    const uInfo: Info = {
      title: `Pending update info ${seed}`,
      content: `This is a update PENDING content ${seed}`,
      status: 2,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp, { "Update of draft info to pending as publisher should not be successful": (r) => r.status === 401 });
  });


  describe('[Info] Test updating from DRAFT to PUBLISHED as PUBLISHER should not be OK', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({ users: {}, groups: {}, sharedBookmarks: {} }, headTeacher2.id,
      [...threadContributorRights, ...threadPublisherRights]);

    shareThreadsOrFail(thread.id, shares);

    // Create an info with PUBLISHED status
    console.log("Creating an info with DRAFT status");
    const infoData: Info = {
      title: `Draft info ${seed}`,
      content: `This is a draft content ${seed}`,
      status: 1, // DRAFT
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    const uInfo: Info = {
      title: `Published update info ${seed}`,
      content: `This is a update PUBLISHED content ${seed}`,
      status: 3,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp, { "Update of draft info to published as publisher should not be successful": (r) => r.status === 401 });
  });

  // ============================================================
  // TESTS DE CAS LIMITS DE DROITS - TRANSITIONS / OWNER
  // ============================================================
};

export function testInfoUpdateOwnerTransition(data: InitData) {
  describe('[Info] Test updating from PENDING to DRAFT as OWNER', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({ users : {}, groups: {}, sharedBookmarks: {}}, headTeacher2.id, threadContributorRights);

    shareThreadsOrFail(thread.id, shares);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    // Create an info with PENDING status
    console.log("Creating an info with PENDING status");
    const infoData: Info = {
      title: `Pending info ${seed}`,
      content: `This is a pending content ${seed}`,
      status: 2, // PENDING
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    const uInfo: Info = {
      title: `Draft update info ${seed}`,
      content: `This is a update draft content ${seed}`,
      status: 1,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp,{ "Update of pending info to draft as owner should be successful" : (r) => r.status === 200 });
  });

  describe('[Info] Test updating from PUBLISHED to DRAFT as OWNER should be OK', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({ users : {}, groups: {}, sharedBookmarks: {}}, headTeacher2.id, threadContributorRights);

    shareThreadsOrFail(thread.id, shares);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    // Create an info with PUBLISHED status
    console.log("Creating an info with PENDING status");
    const infoData: Info = {
      title: `Published info ${seed}`,
      content: `This is a publish content ${seed}`,
      status: 2, // PENDING
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    let uInfo: Info = {
      status: 3,
      thread_id: parseInt(thread.id as string)
    }

    updateInfoOrFail(createResp.id, uInfo);
    console.log(`Info of id ${createResp.id} published`);

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher2.login);
    uInfo = {
      title: `Draft update info ${seed}`,
      content: `This is a update draft content ${seed}`,
      status: 1,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp,{ "Update of published info to draft as owner should be successful" : (r) => r.status === 200 });
  });

  describe('[Info] Test updating from PUBLISHED to PENDING as OWNER should not be OK', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({ users : {}, groups: {}, sharedBookmarks: {}}, headTeacher2.id, threadContributorRights);

    shareThreadsOrFail(thread.id, shares);

    // Create an info with PUBLISHED status
    console.log("Creating an info with PUBLISHED status");
    const infoData: Info = {
      title: `Published info ${seed}`,
      content: `This is a publish content ${seed}`,
      status: 3, // PUBLISHED
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createPublishedInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    const uInfo: Info = {
      title: `Pending update info ${seed}`,
      content: `This is a update PENDING content ${seed}`,
      status: 2,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp,{ "Update of published info to pending as owner should not be successful" : (r) => r.status === 401 });
  });


  describe('[Info] Test updating from DRAFT to PENDING as OWNER should be OK', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({ users : {}, groups: {}, sharedBookmarks: {}}, headTeacher2.id, threadContributorRights);

    shareThreadsOrFail(thread.id, shares);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    // Create an info with PUBLISHED status
    console.log("Creating an info with DRAFT status");
    const infoData: Info = {
      title: `Draft info ${seed}`,
      content: `This is a draft content ${seed}`,
      status: 1, // DRAFT
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    const uInfo: Info = {
      title: `Pending update info ${seed}`,
      content: `This is a update PENDING content ${seed}`,
      status: 2,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp,{ "Update of draft info to pending as owner should be successful" : (r) => r.status === 200 });
  });


  describe('[Info] Test updating from DRAFT to PUBLISHED as OWNER should not be OK', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const headTeacher2 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for draft info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    const shares = addUserSharesInfos({ users : {}, groups: {}, sharedBookmarks: {}}, headTeacher2.id, threadContributorRights);

    shareThreadsOrFail(thread.id, shares);

    console.log("Authenticate head teacher " + headTeacher2.login);
    authenticateWeb(headTeacher2.login);

    // Create an info with PUBLISHED status
    console.log("Creating an info with DRAFT status");
    const infoData: Info = {
      title: `Draft info ${seed}`,
      content: `This is a draft content ${seed}`,
      status: 1, // DRAFT
      thread_id: parseInt(thread.id as string),
    };

    const createResp: Identifier = createPublishedInfoOrFail(infoData);
    console.log(`Info of id ${createResp.id} created`);

    const uInfo: Info = {
      title: `Published update info ${seed}`,
      content: `This is a update PUBLISHED content ${seed}`,
      status: 3,
      thread_id: parseInt(thread.id as string)
    }

    const uResp = updateInfo(createResp.id, uInfo);

    check(uResp,{ "Update of draft info to published as contributor should not be successful" : (r) => r.status === 401 });
  });
};
