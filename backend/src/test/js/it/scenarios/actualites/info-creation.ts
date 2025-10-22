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
  Identifier as ThreadIdentifier,
} from "./_thread-utils.ts";
import {
  createInfo,
  createInfoOrFail,
  createPublishedInfo,
  createPublishedInfoOrFail,
  getInfoById,
  tryGetInfoById,
  Info,
  InfoResponse,
} from "./_info-utils.ts";
import { check } from "k6";
import { RefinedResponse } from "k6/http";

const maxDuration = __ENV.MAX_DURATION || "5m";
const schoolName = __ENV.DATA_SCHOOL_NAME || "Info creation";
const gracefulStop = parseInt(__ENV.GRACEFUL_STOP || "2s");

export const options = {
  setupTimeout: "1h",
  thresholds: {
    checks: ["rate == 1.00"],
  },
  scenarios: {
    testInfoCreation: {
      executor: "per-vu-iterations",
      exec: "testInfoCreation",
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
  describe("[Info-Creation-Init] Initialize data", () => {
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

export function testInfoCreation(data: InitData) {

  // ============================================================
  // TESTS DE CRÉATION AVEC SUCCÈS
  // ============================================================
/**
  describe('[Info] Test creating an info with DRAFT status as thread owner', () => {
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

    const createResp: RefinedResponse<any> = createInfo(infoData);
    check(createResp, {
      "Info creation with DRAFT status must succeed": (r) => r.status === 200,
      "Response contains info ID": (r) => {
        const body = JSON.parse(r.body as string);
        return body.id !== undefined;
      }
    });


  });

  describe('[Info] Test creating an info with PENDING status as thread owner', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for pending info ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    // Create an info with PENDING status
    console.log("Creating an info with PENDING status");
    const infoData: Info = {
      title: `Pending info ${seed}`,
      content: `This is a pending content ${seed}`,
      status: 2, // PENDING
      thread_id: parseInt(thread.id as string),
    };

    const createdInfo = createInfoOrFail(infoData);
    console.log(`Info of id ${createdInfo.id} created with PENDING status`);

    // Verify the created info via GET endpoint
    console.log("Verifying the created info");
    const retrievedInfo: InfoResponse = getInfoById(createdInfo.id);
    console.log(retrievedInfo);

    check(retrievedInfo, {
      "Retrieved info has correct title": (info) => info.title === infoData.title,
      "Retrieved info has PENDING status": (info) => info.status === 'PENDING',
      "Retrieved info has correct thread_id": (info) => info.thread?.id === infoData.thread_id,
    });
  });
**/
  describe('[Info] Test creating a PUBLISHED info as thread owner', () => {
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

    const createResp: RefinedResponse<any> = createPublishedInfo(infoData);
    check(createResp, {
      "Published info creation must succeed": (r) => r.status === 200,
      "Response contains info ID": (r) => {
        const body = JSON.parse(r.body as string);
        return body.id !== undefined;
      }
    });

    const createdInfo = JSON.parse(createResp.body as string);
    console.log(`Info of id ${createdInfo.id} created with PUBLISHED status`);

    // Verify the created info via GET endpoint
    console.log("Verifying the created info");
    const retrievedInfo: InfoResponse = getInfoById(createdInfo.id);
    check(retrievedInfo, {
      "Retrieved info has correct title": (info) => info.title === infoData.title,
      "Retrieved info has PUBLISHED status": (info) => info.status === 'PUBLISHED',
      "Retrieved info has correct thread_id": (info) => info.thread?.id === infoData.thread_id,
    });
  });


  describe('[Info] Test creating an info with all optional fields', () => {
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
      thread_id: parseInt(thread.id as string),
      publication_date: "2025-10-25",
      expiration_date: "2025-12-31",
      is_headline: true,
    };

    const createdInfo = createInfoOrFail(infoData);

    console.log(`Info of id ${createdInfo.id} created with all fields`);

    // Verify all fields are correctly set
    console.log("Verifying all fields");
    const retrievedInfo: InfoResponse = getInfoById(createdInfo.id);

    check(retrievedInfo, {
      "Retrieved info has correct title": (info) => info.title === infoData.title,
      "Retrieved info has correct content": (info) => info.content === infoData.content,
      "Retrieved info has correct status": (info) => info.status === 'DRAFT',
      "Retrieved info has correct thread_id": (info) => info.thread?.id === infoData.thread_id,
      "Retrieved info has publication_date": (info) => info.publicationDate !== undefined && info.publicationDate.includes(infoData.publication_date || ''),
      "Retrieved info has expiration_date": (info) => info.expirationDate !== undefined && info.expirationDate.includes(infoData.expiration_date || ''),
      "Retrieved info has is_headline": (info) => info.headline,
    });
  });

  // ============================================================
  // TESTS DE CAS LIMITES DE DROITS
  // ============================================================

  describe('[Info] Test creating DRAFT info without rights on the thread (should fail)', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const schoolUsers = getUsersOfSchool(data.structures[0]);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const parent = getRandomUserWithProfile(schoolUsers, 'Relative');

    // Teacher creates a thread
    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    console.log("Creating a thread as teacher");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Protected thread ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    // Parent tries to create an info on teacher's thread (without rights)
    console.log("Authenticate parent " + parent.login);
    authenticateWeb(parent.login);

    console.log("Trying to create DRAFT info without rights");
    const infoData: Info = {
      title: `Unauthorized draft ${seed}`,
      content: `This should fail ${seed}`,
      status: 1, // DRAFT
      thread_id: parseInt(thread.id as string),
    };

    const createResp: RefinedResponse<any> = createInfo(infoData);
    check(createResp, {
      "Creating DRAFT info without rights should fail": (r) => r.status === 401 || r.status === 403,
    });
  });

  describe('[Info] Test creating PENDING info without rights on the thread (should fail)', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const schoolUsers = getUsersOfSchool(data.structures[0]);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const parent = getRandomUserWithProfile(schoolUsers, 'Relative');

    // Teacher creates a thread
    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    console.log("Creating a thread as teacher");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Protected thread pending ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    // Parent tries to create a pending info on teacher's thread (without rights)
    console.log("Authenticate parent " + parent.login);
    authenticateWeb(parent.login);

    console.log("Trying to create PENDING info without rights");
    const infoData: Info = {
      title: `Unauthorized pending ${seed}`,
      content: `This should fail ${seed}`,
      status: 2, // PENDING
      thread_id: parseInt(thread.id as string),
    };

    const createResp: RefinedResponse<any> = createInfo(infoData);
    check(createResp, {
      "Creating PENDING info without rights should fail": (r) => r.status === 401 || r.status === 403,
    });
  });

  describe('[Info] Test creating PUBLISHED info without rights on the thread (should fail)', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const schoolUsers = getUsersOfSchool(data.structures[0]);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');
    const parent = getRandomUserWithProfile(schoolUsers, 'Relative');

    // Teacher creates a thread
    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    console.log("Creating a thread as teacher");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Protected thread published ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    // Parent tries to create a published info on teacher's thread (without rights)
    console.log("Authenticate parent " + parent.login);
    authenticateWeb(parent.login);

    console.log("Trying to create PUBLISHED info without rights");
    const infoData = {
      title: `Unauthorized published ${seed}`,
      content: `This should fail ${seed}`,
      thread_id: parseInt(thread.id as string),
    };

    const createResp: RefinedResponse<any> = createPublishedInfo(infoData);
    check(createResp, {
      "Creating PUBLISHED info without rights should fail": (r) => r.status === 401 || r.status === 403,
    });
  });

  describe('[Info] Test that only fields from createInfo.json schema are accepted', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for schema validation ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    // Try to create an info with extra fields not in the schema
    console.log("Creating an info with valid schema fields only");
    const validInfoData: Info = {
      title: `Valid schema info ${seed}`,
      content: `Content with valid fields ${seed}`,
      status: 1, // DRAFT
      thread_id: parseInt(thread.id as string),
      publication_date: "2025-10-25",
      expiration_date: "2025-12-31",
      is_headline: false,
    };

    const validCreateResp: RefinedResponse<any> = createInfo(validInfoData);
    check(validCreateResp, {
      "Creating info with valid schema fields succeeds": (r) => r.status === 200,
    });

    // Try to create an info with an invalid extra field
    console.log("Creating an info with invalid extra field");
    const invalidInfoData = {
      title: `Invalid schema info ${seed}`,
      content: `Content with invalid field ${seed}`,
      status: 1, // DRAFT
      thread_id: parseInt(thread.id as string),
      invalid_field: "This field is not in the schema", // This field should be rejected
    };

    const invalidCreateResp: RefinedResponse<any> = createInfo(invalidInfoData as Info);
    check(invalidCreateResp, {
      "Creating info with invalid field should fail": (r) => r.status === 400 || r.status === 422,
    });
  });

  describe('[Info] Test creating info without required fields (should fail)', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    // Create a thread first
    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const threadTitle = `Thread for required fields test ${seed}`;
    const thread: ThreadIdentifier = createThreadOrFail(threadTitle);
    console.log(`Thread of id ${thread.id} created`);

    // Try to create an info without title (required field)
    console.log("Creating an info without title");
    const infoWithoutTitle = {
      content: `Content without title ${seed}`,
      status: 1,
      thread_id: parseInt(thread.id as string),
    };

    const respWithoutTitle: RefinedResponse<any> = createInfo(infoWithoutTitle as Info);
    check(respWithoutTitle, {
      "Creating info without title should fail": (r) => r.status === 400 || r.status === 422,
    });

    // Try to create an info without thread_id (required field)
    console.log("Creating an info without thread_id");
    const infoWithoutThreadId = {
      title: `Title without thread_id ${seed}`,
      content: `Content without thread_id ${seed}`,
      status: 1,
    };

    const respWithoutThreadId: RefinedResponse<any> = createInfo(infoWithoutThreadId as Info);

    check(respWithoutThreadId, {
      "Creating info without thread_id should fail": (r) => r.status === 401 || r.status === 422,
    });
  });

};
