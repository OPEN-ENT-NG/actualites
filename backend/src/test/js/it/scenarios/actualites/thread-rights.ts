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
  deleteThread, getShareThread,
  Identifier,
  ShareTargetType,
  shareThreadOrFail,
  Thread,
  threadContributorRights,
  threadManagerRights,
  threadPublisherRights,
  updateThread,
} from "./_thread-utils.ts";
import { check } from "k6";
import { RefinedResponse } from "k6/http";

const maxDuration = __ENV.MAX_DURATION || "5m";
const schoolName = __ENV.DATA_SCHOOL_NAME || "Thread-rights";
const gracefulStop = parseInt(__ENV.GRACEFUL_STOP || "2s");

export const options = {
  setupTimeout: "1h",
  thresholds: {
    checks: ["rate == 1.00"],
  },
  scenarios: {
    testThreadMutation: {
      executor: "per-vu-iterations",
      exec: "testThreadRights",
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
    const schoolProfileGroup = getRolesOfStructure(school.id);

    const parentRole = getParentRole(school);
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

export function testThreadRights(data: InitData) {
  describe("[Thread] Test that a user without workflow right can't create a thread ", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headRelative = getRandomUserWithProfile(headUsers, "Relative");

    //now call create bookmark that call get bookmark that check visible
    console.log("Authenticate head teacher " + headRelative.login);
    authenticateWeb(headRelative.login);

    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const title = `Creation test ${seed}`;
    const threadResp: RefinedResponse<any> = createThread(title);
    check(threadResp, {
      "Thread creation must be forbidden": (r) => r.status === 401,
    });
  });

  describe("[Thread] Test that a user can't update a thread without manager right", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, "Teacher");
    const headRelative = getRandomUserWithProfile(headUsers, "Relative");

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const title = `Creation and share test ${seed}`;
    const threadResp: Identifier = createThreadOrFail(title);

    console.log(` Thread of id ${threadResp.id} created`);

    authenticateWeb(headRelative.login);

    const titleUpdate = `Update test ${seed}`;
    const threadUpdate: Thread = {
      title: titleUpdate,
      mode: 0,
      icon: "",
    };

    const upResp: RefinedResponse<any> = updateThread(threadUpdate, threadResp.id);
    check(upResp, {
      "Thread update without manager rights must not be successful": (r) => r.status === 401,
    });
  });

  describe("[Thread] Test that a user can update a thread with manager right", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, "Teacher");
    const headRelative = getRandomUserWithProfile(headUsers, "Relative");

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const title = `Creation and share test ${seed}`;
    const threadResp: Identifier = createThreadOrFail(title);
    console.log(` Thread of id ${threadResp.id} created`);

    shareThreadOrFail(threadResp.id, [headRelative.id],
                                     [...threadManagerRights, ...threadContributorRights, ...threadPublisherRights],
                                     ShareTargetType.USER);

    authenticateWeb(headRelative.login);

    const titleUpdate = `Update test ${seed}`;
    const threadUpdate: Thread = {
      title: titleUpdate,
      mode: 0,
      icon: "",
    };

    const upResp: RefinedResponse<any> = updateThread(threadUpdate, threadResp.id);
    check(upResp, {
      "Thread update on a thread you have manager rights must be successful": (r) => r.status < 300,
    });
  });

  describe("[Thread] Test that a user can't delete a thread he doesn't own ", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, "Teacher");
    const headRelative = getRandomUserWithProfile(headUsers, "Relative");

    //now call create bookmark that call get bookmark that check visible
    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const title = `Creation test ${seed}`;
    const thread: Identifier = createThreadOrFail(title);

    authenticateWeb(headRelative.login);
    console.log("Deleting the thread");

    const deleteResp: RefinedResponse<any> = deleteThread(thread.id);
    check(deleteResp, {
      "Thread delete on a thread you don't own must not be successful": (r) => r.status === 401,
    });
  });

  describe("[Thread] Test that a user can delete a thread he doesn't own but he have manger rights ", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, "Teacher");
    const headRelative = getRandomUserWithProfile(headUsers, "Relative");

    //now call create bookmark that call get bookmark that check visible
    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const title = `Creation test ${seed}`;
    const thread: Identifier = createThreadOrFail(title);
    shareThreadOrFail(thread.id, [headRelative.id],
      [...threadManagerRights, ...threadContributorRights, ...threadPublisherRights],
      ShareTargetType.USER);

    authenticateWeb(headRelative.login);
    console.log("Deleting the thread");

    const deleteResp: RefinedResponse<any> = deleteThread(thread.id);
    check(deleteResp, {
      "Thread delete on a thread you don't own but you have manager right must be successful": (r) => r.status < 300,
    });
  });

  describe("[Thread] Test that a user can share a thread he doesn't own but he have manger rights ", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, "Teacher");
    const headRelative = getRandomUserWithProfile(headUsers, "Relative");
    let headRelative2 = getRandomUserWithProfile(headUsers, "Relative");
    let i = 0;
    while(headRelative.id === headRelative2.id && i < 10) {
      i++;
      headRelative2 = getRandomUserWithProfile(headUsers, "Relative");
    }

    //now call create bookmark that call get bookmark that check visible
    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const title = `Creation test ${seed}`;
    const thread: Identifier = createThreadOrFail(title);
    shareThreadOrFail(thread.id, [headRelative.id],
      [...threadManagerRights, ...threadContributorRights, ...threadPublisherRights],
      ShareTargetType.USER);

    authenticateWeb(headRelative.login);
    console.log(`Sharing the thread with headRelative ${headRelative.id}.`);

    shareThreadOrFail(thread.id,
                      [headRelative2.id],
                      threadContributorRights,
                      ShareTargetType.USER);

    authenticateWeb(headTeacher.login);

    const shareResp = getShareThread(thread.id);

    const rightCheck = function(r: RefinedResponse<any>): boolean {
      let rights = JSON.parse(r.body as string).users.checked[headRelative2.id];
      let rightIncluded = true;
      threadContributorRights.forEach( right=> rightIncluded &&= rights.includes(right));
      return rightIncluded;
    };

    check(shareResp, {
      "Get share for owner must be successful": (r) => r.status < 300,
      "User must be in the share": (r) => JSON.parse(r.body as string).users.checked[headRelative2.id] !== undefined,
      "User share must contain contributor right": rightCheck
    });
  });

}
