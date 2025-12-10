import { describe } from "https://jslib.k6.io/k6chaijs/4.3.4.0/index.js";

import {
  addCommRuleToGroup,
  attachStructureAsChild,
  authenticateWeb,
  createAndSetRole,
  getParentRole,
  getRandomUserWithProfile,
  getRolesOfStructure,
  getTeacherRole,
  getUsersOfSchool,
  initStructure,
  linkRoleToUsers,
  Role,
  Session,
  Structure,
} from "../../../node_modules/edifice-k6-commons/dist/index.js";
import {
  createThread,
  createThreadOrFail,
  deleteThread,
  getThreadById,
  Identifier,
  shareThread,
  Thread,
  threadContributorRights,
  threadExists,
  updateThread,
} from "../../../utils/_thread-utils.ts";
import { check } from "k6";
import { RefinedResponse } from "k6/http";
import {ShareTargetType} from "../../../utils/_shares_utils.ts";

const maxDuration = __ENV.MAX_DURATION || "5m";
const schoolName = __ENV.DATA_SCHOOL_NAME || "Thread management";
const gracefulStop = parseInt(__ENV.GRACEFUL_STOP || "2s");

export const options = {
  setupTimeout: "1h",
  thresholds: {
    checks: ["rate == 1.00"],
  },
  scenarios: {
    testThreadMutation: {
      executor: "per-vu-iterations",
      exec: "testThreadMutation",
      vus: 1,
      maxDuration: maxDuration,
      gracefulStop,
    },
  },
};

type InitData = {
  head: Structure;
  structures: Structure[];
};

export function setup() {
  let head: Structure | null = null;
  const structures: Structure[] = [];
  describe("[Tread-Management-Init] Initialize data", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    head = initStructure(`${schoolName} - Head`);
    const teacherProfileGroup = getTeacherRole(head);
    const attachedStructuresGroups: string[] = [];
    //const i = Math.floor(Math.random() * 1000000);
    const school = initStructure(`${schoolName} - School`);
    structures.push(school);
    attachStructureAsChild(head, school);
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

export function testThreadMutation(data: InitData) {
  describe("[Thread] Test that a user can create a thread then retrieve it ", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, "Teacher");

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const title = `Creation test ${seed}`;
    const threadResp: RefinedResponse<any> = createThread(title, data.head.id);
    check(threadResp, {
      "Thread creation must be in success": (r) => r.status === 200,
    });

    const thread = JSON.parse(threadResp.body as string);

    console.log(` Thread of id ${thread.id} created`);

    const threadById = getThreadById(thread.id);
    check(threadById, {
      "Thread must have the title define": (t) => t.title === title,
    });
  });

  describe("[Thread] Test that a user can update a thread he own then retrieve it ", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, "Teacher");

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const title = `Creation test ${seed}`;
    const thread: Identifier = createThreadOrFail(title, data.head.id);

    console.log("Updating the thread");
    const titleUpdate = `Update test ${seed}`;
    const threadUpdate: Thread = {
      title: titleUpdate,
      mode: 0,
      icon: "",
    };

    const upResp: RefinedResponse<any> = updateThread(threadUpdate, thread.id);
    check(upResp, {
      "Thread update must be successful": (r) => r.status === 200,
    });

    const threadById = getThreadById(thread.id);
    check(threadById, {
      "Thread must have the title updated": (t) => t.title === titleUpdate,
    });
  });

  describe("[Thread] Test that a user can delete a thread he own ", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, "Teacher");

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const title = `Creation test ${seed}`;
    const thread: Identifier = createThreadOrFail(title, data.head.id);

    console.log("deleting the thread");

    const deleteResp: RefinedResponse<any> = deleteThread(thread.id);
    check(deleteResp, {
      "Thread delete must be successful": (r) => r.status === 200,
    });

    threadExists(thread.id);
  });

  describe("[Thread] Test that a user can create a thread then share it ", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, "Teacher");
    const headRelative = getRandomUserWithProfile(headUsers, "Relative");

    //now call create bookmark that call get bookmark that check visible
    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const title = `Creation and share test ${seed}`;
    const threadResp: Identifier = createThreadOrFail(title, data.head.id);

    console.log(` Thread of id ${threadResp.id} created`);

    const resp = shareThread(threadResp.id, [headRelative.id], threadContributorRights, ShareTargetType.USER);
    check(resp, { "Thread sharing must be a success": (r) => r.status < 300 });
  });
}
