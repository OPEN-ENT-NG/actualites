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
  addAdminFunction,
  getProfileGroupsOfStructure,
  ProfileGroup
} from "../../../node_modules/edifice-k6-commons/dist/index.js";
import {
  createThread,
  createThreadOrFail,
  deleteThread, getShareThread,
  Identifier,
  shareThreadOrFail,
  Thread,
  threadContributorRights,
  threadManagerRights,
  threadPublisherRights,
  updateThread,
} from "../../../utils/_thread-utils.ts";
import { check, sleep } from "k6";
import { RefinedResponse } from "k6/http";
import { ShareTargetType } from "../../../utils/_shares_utils.ts";

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

    const headUsers = getUsersOfSchool(head);
    const headTeacher = getRandomUserWithProfile(headUsers, "Teacher");

    addAdminFunction(headTeacher.id, [head.id]);

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
    const threadResp: RefinedResponse<any> = createThread(title, data.head.id);
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
    const threadResp: Identifier = createThreadOrFail(title, data.head.id);

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
    const threadResp: Identifier = createThreadOrFail(title, data.head.id);
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
    const thread: Identifier = createThreadOrFail(title, data.head.id);

    authenticateWeb(headRelative.login);
    console.log("Deleting the thread");

    const deleteResp: RefinedResponse<any> = deleteThread(thread.id);
    check(deleteResp, {
      "Thread delete on a thread you don't own must not be successful": (r) => r.status === 401,
    });
  });

  describe("[Thread] Test that a user can delete a thread he doesn't own but has manager rights on it ", () => {
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
    const thread: Identifier = createThreadOrFail(title, data.head.id);
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

  describe("[Thread] Test that a user can share a thread he doesn't own, but has manager rights on it ", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, "Teacher");
    let headTeacher2 = getRandomUserWithProfile(headUsers, "Teacher", [headTeacher]);

    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const title = `Creation test ${seed}`;
    const thread: Identifier = createThreadOrFail(title, data.head.id);

    shareThreadOrFail(thread.id, [headTeacher2.id],
      [...threadManagerRights, ...threadContributorRights, ...threadPublisherRights],
      ShareTargetType.USER);

    authenticateWeb(headTeacher2.login);
    console.log(`Sharing the thread with headTeacher2 ${headTeacher2.id}.`);

    let headRelative = getRandomUserWithProfile(headUsers, "Relative");

    console.log(`Sharing the thread to ${headRelative.id}.`);
    shareThreadOrFail(thread.id,
                      [headRelative.id, headTeacher2.id],
                      [...threadManagerRights, ...threadContributorRights, ...threadPublisherRights],
                      ShareTargetType.USER);

    const shareResp = getShareThread(thread.id);

    const rightCheck = function(r: RefinedResponse<any>): boolean {
      let rights = JSON.parse(r.body as string).users.checked[headRelative.id];
      let rightIncluded = true;
      threadContributorRights.forEach( right=> rightIncluded &&= rights.includes(right));
      return rightIncluded;
    };

    check(shareResp, {
      "Get share for owner must be successful": (r) => r.status < 300,
      "User must be in the share": (r) => JSON.parse(r.body as string).users.checked[headRelative.id] !== undefined,
      "User share must contain contributor right": rightCheck
    });
  });


  describe("[Thread] Test that created thread has admin local group", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const headTeacher = getRandomUserWithProfile(headUsers, "Teacher");

    //now call create bookmark that call get bookmark that check visible
    console.log("Authenticate head teacher " + headTeacher.login);
    authenticateWeb(headTeacher.login);

    console.log("Creating a thread");
    const seed = Math.random().toString(36).substring(7);
    const title = `Creation test ${seed}`;
    const thread: Identifier = createThreadOrFail(title, data.head.id);
    //share is async
    sleep(1);
    const shareResp = getShareThread(thread.id);
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const groups : ProfileGroup[] = getProfileGroupsOfStructure(data.head.id);

    const adminLocalGroups = groups.filter(g => g.filter === "AdminLocal");
    const adminLocalGroup = adminLocalGroups[0];

    const shareGroups: any[] = JSON.parse(shareResp.body as any).groups.visibles;
    console.log("Created groups for admin local group " + shareGroups);
    check(shareGroups, {
      "share groups should contain admin group ": shareGroups => shareGroups.filter( g => g.id === adminLocalGroup.id).length > 0
    });

  });

}
