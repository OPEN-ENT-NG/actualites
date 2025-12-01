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
  getParentRole,
} from '../../../node_modules/edifice-k6-commons/dist/index.js';
import {
  shareInfosOrFail,
} from "../../../utils/_shares_utils.ts";
import {
  createThreadOrFail,
  Identifier as ThreadIdentifier,
} from "../../../utils/_thread-utils.ts";
import {
  createPublishedInfoOrFail,
} from "../../../utils/_info-utils.ts";
import {
  createCommentOrFail,
  createCommentV1,
  updateComment,
  updateCommentV1,
  deleteComment,
  deleteCommentV1,
  getCommentsOrFail,
} from "../../../utils/_comment-utils.ts";
import { check } from "k6";

const maxDuration = __ENV.MAX_DURATION || "5m";
const schoolName = __ENV.DATA_SCHOOL_NAME || "Comment management";
const gracefulStop = parseInt(__ENV.GRACEFUL_STOP || "2s");

export const options = {
  setupTimeout: "1h",
  thresholds: {
    checks: ["rate == 1.00"],
  },
  scenarios: {
    testCommentManagement: {
      executor: "per-vu-iterations",
      exec: "testCommentManagement",
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
  describe("[Comment-Management-Init] Initialize data", () => {
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

export function testCommentManagement(data: InitData) {

  // ============================================================
  // TESTS DE MODIFICATION DE COMMENTAIRES
  // ============================================================

  describe('[Comment] Test that comment owner can update their own comment', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const teacher1 = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate teacher1 " + teacher1.login);
    authenticateWeb(teacher1.login);

    // Create a thread and a published info
    console.log("Creating thread and info");
    const seed = Math.random().toString(36).substring(7);
    const thread: ThreadIdentifier = createThreadOrFail(`Thread comment update ${seed}`);
    const info = createPublishedInfoOrFail({
      title: `Info for comment update ${seed}`,
      content: `Content ${seed}`,
      thread_id: parseInt(thread.id as string),
    });

    // Teacher1 creates a comment
    console.log("Creating comment as teacher1");
    const comment = createCommentOrFail(info.id, `Original comment ${seed}`);
    console.log(`Comment ${comment.id} created`);

    // Teacher1 updates their own comment
    console.log("Updating comment as owner");
    const updateResp = updateComment(info.id, comment.id, `Updated comment ${seed}`);
    check(updateResp, {
      "Owner can update their own comment": (r) => r.status === 200,
    });

    // Verify the comment was updated
    const comments = getCommentsOrFail(info.id);
    const updatedComment = comments.find((c) => c._id === comment.id);

    check(updatedComment, {
      "Comment text was updated": (c) => c?.comment === `Updated comment ${seed}`,
    });
  });

  describe('[Comment] Test that non-owner cannot update someone elses comment', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const teacher1 = getRandomUserWithProfile(headUsers, 'Teacher');
    const teacher2 = getRandomUserWithProfile(headUsers.filter((u) => u.login !== teacher1.login), 'Teacher');

    console.log("Authenticate teacher1 " + teacher1.login);
    authenticateWeb(teacher1.login);

    // Teacher1 creates a thread and a published info with comment rights for teacher2
    console.log("Creating thread and info");
    const seed = Math.random().toString(36).substring(7);
    const thread: ThreadIdentifier = createThreadOrFail(`Thread comment rights ${seed}`);
    const info = createPublishedInfoOrFail({
      title: `Info for comment rights ${seed}`,
      content: `Content ${seed}`,
      thread_id: parseInt(thread.id as string),
    });

    // Share the info with comment rights to teacher2
    console.log("Sharing info with comment rights to teacher2");
    const sharePayload = {
      userId: teacher2.id,
      "net-atos-entng-actualites-controllers-CommentController|comment": true,
    };
    shareInfosOrFail(info.id.toString(), {
      users: {
        [sharePayload.userId]: ["net-atos-entng-actualites-controllers-CommentController|comment"]
      }
    });

    // Teacher1 creates a comment
    console.log("Creating comment as teacher1");
    const comment = createCommentOrFail(info.id, `Comment by teacher1 ${seed}`);
    console.log(`Comment ${comment.id} created by teacher1`);

    // Teacher2 tries to update teacher1's comment (should fail)
    console.log("Authenticate teacher2 " + teacher2.login);
    authenticateWeb(teacher2.login);

    console.log("Trying to update comment as non-owner");
    const updateResp = updateComment(info.id, comment.id, `Hacked by teacher2 ${seed}`);
    check(updateResp, {
      "Non-owner cannot update someone else's comment": (r) => r.status === 401 || r.status === 403,
    });

    // Verify the comment was NOT updated
    authenticateWeb(teacher1.login);
    const comments = getCommentsOrFail(info.id);
    const originalComment = comments.find((c) => c._id === comment.id);
    check(originalComment, {
      "Comment text was not modified": (c) => c?.comment === `Comment by teacher1 ${seed}`,
    });
  });

  describe('[Comment] Test that thread manager cannot update someone elses comment (only delete)', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const schoolUsers = getUsersOfSchool(data.structures[0]);
    const teacher = getRandomUserWithProfile(headUsers, 'Teacher'); // Thread owner/manager
    const parent = getRandomUserWithProfile(schoolUsers, 'Relative');

    console.log("Authenticate teacher (thread owner) " + teacher.login);
    authenticateWeb(teacher.login);

    // Teacher creates a thread and a published info
    console.log("Creating thread and info");
    const seed = Math.random().toString(36).substring(7);
    const thread: ThreadIdentifier = createThreadOrFail(`Thread manager test ${seed}`);
    const info = createPublishedInfoOrFail({
      title: `Info for manager test ${seed}`,
      content: `Content ${seed}`,
      thread_id: parseInt(thread.id as string),
    });

    // Share the info with comment rights to parent
    console.log("Sharing info with comment rights to parent");
    const sharePayload = {
      userId: parent.id,
      "net-atos-entng-actualites-controllers-CommentController|comment": true,
    };
    shareInfosOrFail(info.id.toString(), {
      users: {
        [sharePayload.userId]: ["net-atos-entng-actualites-controllers-CommentController|comment"]
      }
    });

    // Parent creates a comment
    console.log("Authenticate parent " + parent.login);
    authenticateWeb(parent.login);
    console.log("Creating comment as parent");
    const comment = createCommentOrFail(info.id, `Comment by parent ${seed}`);
    console.log(`Comment ${comment.id} created by parent`);

    // Teacher (thread manager) tries to update parent's comment (should fail)
    console.log("Authenticate teacher (manager) " + teacher.login);
    authenticateWeb(teacher.login);

    console.log("Trying to update comment as thread manager");
    const updateResp = updateComment(info.id, comment.id, `Modified by manager ${seed}`);
    check(updateResp, {
      "Thread manager cannot update someone else's comment": (r) => r.status === 401 || r.status === 403,
    });

    // Verify the comment was NOT updated
    const comments = getCommentsOrFail(info.id);
    const originalComment = comments.find((c) => c._id === comment.id);
    check(originalComment, {
      "Comment text was not modified by manager": (c) => c?.comment === `Comment by parent ${seed}`,
    });
  });

  describe('[Comment] Test V1 API - owner can update their own comment', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const teacher = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate teacher " + teacher.login);
    authenticateWeb(teacher.login);

    // Create a thread and a published info
    console.log("Creating thread and info");
    const seed = Math.random().toString(36).substring(7);
    const thread: ThreadIdentifier = createThreadOrFail(`Thread V1 comment ${seed}`);
    const info = createPublishedInfoOrFail({
      title: `Info for V1 comment ${seed}`,
      content: `Content ${seed}`,
      thread_id: parseInt(thread.id as string),
    });

    // Create a comment using V1 API
    console.log("Creating comment using V1 API");
    const createResp = createCommentV1(info.id, `V1 original comment ${seed}`);
    check(createResp, {
      "V1 API: Comment creation succeeds": (r) => r.status === 200,
    });
    const comment = JSON.parse(createResp.body as string);

    // Update the comment using V1 API
    console.log("Updating comment using V1 API");
    const updateResp = updateCommentV1(info.id, comment.id, `V1 updated comment ${seed}`);
    check(updateResp, {
      "V1 API: Owner can update their own comment": (r) => r.status === 200,
    });

    // Verify the comment was updated
    const comments = getCommentsOrFail(info.id);
    const updatedComment = comments.find((c) => c._id === comment.id);
    check(updatedComment, {
      "V1 API: Comment text was updated": (c) => c?.comment === `V1 updated comment ${seed}`,
    });
  });

  // ============================================================
  // TESTS DE SUPPRESSION DE COMMENTAIRES
  // ============================================================

  describe('[Comment] Test that comment owner can delete their own comment', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const teacher = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate teacher " + teacher.login);
    authenticateWeb(teacher.login);

    // Create a thread and a published info
    console.log("Creating thread and info");
    const seed = Math.random().toString(36).substring(7);
    const thread: ThreadIdentifier = createThreadOrFail(`Thread comment delete ${seed}`);
    const info = createPublishedInfoOrFail({
      title: `Info for comment delete ${seed}`,
      content: `Content ${seed}`,
      thread_id: parseInt(thread.id as string),
    });

    // Create a comment
    console.log("Creating comment");
    const comment = createCommentOrFail(info.id, `Comment to delete ${seed}`);
    console.log(`Comment ${comment.id} created`);

    // Delete the comment
    console.log("Deleting comment as owner");
    const deleteResp = deleteComment(info.id, comment.id);
    check(deleteResp, {
      "Owner can delete their own comment": (r) => r.status === 200,
    });

    // Verify the comment was deleted
    const comments = getCommentsOrFail(info.id);
    check(comments, {
      "Comment was deleted": (c) => !c.find((comment) => comment._id === comment.id),
    });
  });

  describe('[Comment] Test that thread manager/validator can delete any comment', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const schoolUsers = getUsersOfSchool(data.structures[0]);
    const teacher = getRandomUserWithProfile(headUsers, 'Teacher'); // Thread owner/manager
    const parent = getRandomUserWithProfile(schoolUsers, 'Relative');

    console.log("Authenticate teacher (thread owner) " + teacher.login);
    authenticateWeb(teacher.login);

    // Teacher creates a thread and a published info
    console.log("Creating thread and info");
    const seed = Math.random().toString(36).substring(7);
    const thread: ThreadIdentifier = createThreadOrFail(`Thread manager delete ${seed}`);
    const info = createPublishedInfoOrFail({
      title: `Info for manager delete ${seed}`,
      content: `Content ${seed}`,
      thread_id: parseInt(thread.id as string),
    });

    // Share the info with comment rights to parent
    console.log("Sharing info with comment rights to parent");
    const sharePayload = {
      userId: parent.id,
      "net-atos-entng-actualites-controllers-CommentController|comment": true,
    };
    shareInfosOrFail(info.id.toString(), {
      users: {
        [sharePayload.userId]: ["net-atos-entng-actualites-controllers-CommentController|comment"]
      }
    });

    // Parent creates a comment
    console.log("Authenticate parent " + parent.login);
    authenticateWeb(parent.login);
    console.log("Creating comment as parent");
    const comment = createCommentOrFail(info.id, `Comment by parent to delete ${seed}`);
    console.log(`Comment ${comment.id} created by parent`);

    // Teacher (thread manager) deletes parent's comment (should succeed)
    console.log("Authenticate teacher (manager) " + teacher.login);
    authenticateWeb(teacher.login);

    console.log("Deleting comment as thread manager");
    const deleteResp = deleteComment(info.id, comment.id);
    check(deleteResp, {
      "Thread manager can delete any comment": (r) => r.status === 200,
    });

    // Verify the comment was deleted
    const comments = getCommentsOrFail(info.id);
    check(comments, {
      "Comment was deleted by manager": (c) => !c.find((c) => c._id === comment.id),
    });
  });

  describe('[Comment] Test that user without rights cannot delete someone elses comment', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const teacher1 = getRandomUserWithProfile(headUsers, 'Teacher');
    const teacher2 = getRandomUserWithProfile(headUsers.filter((u) => u.login !== teacher1.login), 'Teacher');

    console.log("Authenticate teacher1 " + teacher1.login);
    authenticateWeb(teacher1.login);

    // Teacher1 creates a thread and a published info
    console.log("Creating thread and info");
    const seed = Math.random().toString(36).substring(7);
    const thread: ThreadIdentifier = createThreadOrFail(`Thread delete rights ${seed}`);
    const info = createPublishedInfoOrFail({
      title: `Info for delete rights ${seed}`,
      content: `Content ${seed}`,
      thread_id: parseInt(thread.id as string),
    });

    // Share the info with comment rights to teacher2
    console.log("Sharing info with comment rights to teacher2");
    const sharePayload = {
      userId: teacher2.id,
      "net-atos-entng-actualites-controllers-CommentController|comment": true,
    };
    shareInfosOrFail(info.id.toString(), {
      users: {
        [sharePayload.userId]: ["net-atos-entng-actualites-controllers-CommentController|comment"]
      }
    });

    // Teacher1 creates a comment
    console.log("Creating comment as teacher1");
    const comment = createCommentOrFail(info.id, `Comment by teacher1 ${seed}`);
    console.log(`Comment ${comment.id} created by teacher1`);

    // Teacher2 tries to delete teacher1's comment (should fail)
    console.log("Authenticate teacher2 " + teacher2.login);
    authenticateWeb(teacher2.login);

    console.log("Trying to delete comment as non-owner without manager rights");
    const deleteResp = deleteComment(info.id, comment.id);
    check(deleteResp, {
      "User without rights cannot delete someone else's comment": (r) => r.status === 401 || r.status === 403,
    });

    // Verify the comment was NOT deleted
    authenticateWeb(teacher1.login);
    const comments = getCommentsOrFail(info.id);
    const stillExistingComment = comments.find((c) => c._id === comment.id);
    check(stillExistingComment, {
      "Comment still exists": (c) => c !== undefined,
      "Comment text unchanged": (c) => c?.comment === `Comment by teacher1 ${seed}`,
    });
  });

  describe('[Comment] Test V1 API - delete operations', () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    const headUsers = getUsersOfSchool(data.head);
    const teacher = getRandomUserWithProfile(headUsers, 'Teacher');

    console.log("Authenticate teacher " + teacher.login);
    authenticateWeb(teacher.login);

    // Create a thread and a published info
    console.log("Creating thread and info");
    const seed = Math.random().toString(36).substring(7);
    const thread: ThreadIdentifier = createThreadOrFail(`Thread V1 delete ${seed}`);
    const info = createPublishedInfoOrFail({
      title: `Info for V1 delete ${seed}`,
      content: `Content ${seed}`,
      thread_id: parseInt(thread.id as string),
    });

    // Create a comment using V1 API
    console.log("Creating comment using V1 API");
    const createResp = createCommentV1(info.id, `V1 comment to delete ${seed}`);
    check(createResp, {
      "V1 API: Comment creation succeeds": (r) => r.status === 200,
    });
    const comment = JSON.parse(createResp.body as string);

    // Delete the comment using V1 API
    console.log("Deleting comment using V1 API");
    const deleteResp = deleteCommentV1(info.id, comment.id);
    check(deleteResp, {
      "V1 API: Owner can delete their own comment": (r) => r.status === 200,
    });

    // Verify the comment was deleted
    const comments = getCommentsOrFail(info.id);
    check(comments, {
      "V1 API: Comment was deleted": (c) => !c.find((c) => c._id === comment.id),
    });
  });
}
