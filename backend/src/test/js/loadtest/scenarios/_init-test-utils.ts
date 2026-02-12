import { describe } from "https://jslib.k6.io/k6chaijs/4.3.4.0/index.js";
import http from 'k6/http';

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
  attachStructureAsChild,
  linkRoleToUsers,
  getProfileGroupOfStructure,
  getParentRole,
  getStudentRole,
  RoleOfStructure,
  addAdminFunction,
  getRolesOfStructure,
  addCommRuleToGroup,
  switchSession,
  Cookie,
  SessionMode,
  BASE_URL
} from '../../node_modules/edifice-k6-commons/dist/index.js';
import {
  createThreadOrFail,
  Identifier as ThreadIdentifier, shareThreadOrFail, threadAllRights,
} from "../../utils/_thread-utils.ts";
import {
  createInfoOrFail,
  createPublishedInfoOrFail,
} from "../../utils/_info-utils.ts";
import { ShareTargetType } from "../../utils/_shares_utils.ts";
import { SharedArray } from 'k6/data';
import {pendingVus} from "./t1-averageLoad.ts";

const nbInfosPublish = (__ENV.LOCAL_NB_INFOS_PUBLISH ? Number(__ENV.LOCAL_NB_INFOS_PUBLISH) :  300);
const nbInfosPending = (__ENV.LOCAL_NB_INFOS_PENDING ? Number(__ENV.LOCAL_NB_INFOS_PENDING) :  30);
const nbInfosDraft = (__ENV.LOCAL_NB_INFOS_DRAFT ? Number(__ENV.LOCAL_NB_INFOS_DRAFT) :  20);

const duration = __ENV.DURATION || '1m';
const authBatchSize = Number.parseInt(__ENV.AUTH_BATCH_SIZE || '10');
const THIRTY_MINUTES_IN_SECONDS = 30 * 60;

function parseCsv(filePath: string): string[][] {
  return open(filePath)
    .split('\n')
    .filter((line: string) => line.trim().length > 0)
    .map((line: string) => line.split(',').map((f: string) => f.trim()));
}

export type InfoUser = {
  login: string;
  session: Session;
  profile: 'Default' | 'ADML' | 'MULTIADML' | string;
  threadId: string;
  role: 'READER' | 'CONTRIBUTOR' | 'PUBLISHER' | string;
  isValidator: boolean
}

interface SessionMap {
  [Key: string] : InfoUser[]
}

export type InitData = {
  sessions: SessionMap,
  allSessions: InfoUser[],
}

const teachersRecords = new SharedArray('teachers', () => parseCsv('../data/teachers.csv'));
const studentsRecords = new SharedArray('students', () => parseCsv('../data/students.csv'));
const relativesRecords = new SharedArray('relatives', () => parseCsv('../data/relatives.csv'));
const personnelsRecords = new SharedArray('personnels', () => parseCsv('../data/personnels.csv'));

export function initLocal(schoolName: string): InitData {

  let initData: InitData = { sessions :  {}, allSessions: [] };

  describe("[Info-Widget-Init] Initialize data", () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);
    let head = initStructure(`${schoolName} - Head`)
    let school: Structure = initStructure(`${schoolName} - School`);
    attachStructureAsChild(head, school);

    const role: Role = createAndSetRole("Actualites");

    const teacherProfileGroup = getTeacherRole(head);
    const personnelProfileGroup =  getProfileGroupOfStructure("staff", head);
    const studentProfileRole : RoleOfStructure = getStudentRole(school);
    const relativeProfileRole : RoleOfStructure = getParentRole(school);

    linkRoleToUsers(head, role, [teacherProfileGroup.name]);
    linkRoleToUsers(head, role, [personnelProfileGroup.name]);
    linkRoleToUsers(school, role, [studentProfileRole.name]);
    linkRoleToUsers(school, role, [relativeProfileRole.name]);

    const attachedStructuresGroups = [];
    const schoolProfileGroup = getRolesOfStructure(school.id);
    attachedStructuresGroups.push(...schoolProfileGroup.map((s) => s.id));

    for (let group of attachedStructuresGroups) {
      addCommRuleToGroup(group, [teacherProfileGroup.id]);
    }
    addCommRuleToGroup(personnelProfileGroup.id, [teacherProfileGroup.id]);

    const headUsers = getUsersOfSchool(head);
    const schoolUsers = getUsersOfSchool(school);

    let teacher = getRandomUserWithProfile(headUsers, 'Teacher');

    addAdminFunction(teacher.id, [head.id]);
    authenticateWeb(teacher.login);

    const seed = Math.random().toString(36).substring(7);
    const thread: ThreadIdentifier = createThreadOrFail(`Thread 1 ${seed}`, head.id);

    console.log("Created thread ",`Thread 1 ${seed} `, thread.id );

    shareThreadOrFail(thread.id, [teacherProfileGroup.id, personnelProfileGroup.id, studentProfileRole.id, relativeProfileRole.id], threadAllRights, ShareTargetType.GROUP);

    const targetHeadUsers = headUsers.filter(headUser => headUser.type === 'Teacher' || headUser.type === 'Personnel');
    const targetSchoolUsers = schoolUsers.filter(headUser => headUser.type === 'Student' || headUser.type === 'Relative' );

    for (let i = 0; i < targetHeadUsers.length && i < 10; i++) {
      let userInfo = targetHeadUsers[i];
      if(!initData.sessions[userInfo.type]) {
        initData.sessions[userInfo.type] = [];
      }
      const user: InfoUser = {
        login : userInfo.login,
        profile: userInfo.id !== head.id ? "Default" : "MULTIADML",
        session :  <Session>authenticateWeb(userInfo.login, __ENV.ADMC_PASSWORD),
        role: "PUBLISHER",
        threadId: thread.id,
        isValidator: false
      }
      initData.sessions[userInfo.type].push(user);
      initData.allSessions.push(user)
    }

    for (let i = 0; i < targetSchoolUsers.length && i < 10; i++) {
      let userInfo = targetSchoolUsers[i];
      if(!initData.sessions[userInfo.type]) {
        initData.sessions[userInfo.type] = [];
      }
      const user: InfoUser = {
        login : userInfo.login,
        profile: "Default",
        session :  <Session>authenticateWeb(userInfo.login, __ENV.ADMC_PASSWORD),
        role: "READER",
        threadId: thread.id,
        isValidator: false
      };
      initData.sessions[userInfo.type].push(user);
      initData.allSessions.push(user);
    }

    console.log("Logger teacher ", teacher.login);
    authenticateWeb(teacher.login);

    const now = new Date();
    const futureExpirationDate = new Date(now.getTime() + 3600*24*1000);

    console.log("Creating infos with PUBLISHED status");


    for (let i = 0; i < nbInfosPublish; i++) {
      //last published info
      createPublishedInfoOrFail({
        title: `Incoming info ${seed}`,
        content: `Incoming content`,
        thread_id: parseInt(thread.id as string),
        status: 3,
        publication_date: "2020-01-01T00:00:00Z",
        expiration_date: futureExpirationDate.toISOString(),
      } as any);
    }

    console.log("Creating infos with DRAFT status");

    for (let i = 0; i < nbInfosDraft; i++) {
      //draft should not be visible
      createInfoOrFail({
        title: `Incoming info ${seed}`,
        content: `Incoming content`,
        thread_id: parseInt(thread.id as string),
        status: 1,
        publication_date:  "2020-01-01T00:00:00Z",
        expiration_date: futureExpirationDate.toISOString(),
      } as any);
    }

    console.log("Creating infos with PENDING status");

    for (let i = 0; i < nbInfosPending; i++) {
      //pending should not be visible
      createInfoOrFail({
        title: `Incoming info ${seed}`,
        content: `Incoming content`,
        thread_id: parseInt(thread.id as string),
        status: 2,
        publication_date:  "2020-01-01T00:00:00Z",
        expiration_date: futureExpirationDate.toISOString(),
      } as any);
    }

    for (let i = 0; i < 80; i++) {
      //expired info
      createPublishedInfoOrFail({
        title: `Incoming info ${seed}`,
        content: `Incoming content`,
        thread_id: parseInt(thread.id as string),
        status: 3,
        publication_date: "2020-01-01T00:00:00Z",
        expiration_date:  "2021-01-01T00:00:00Z",
      } as any);
    }
  });
  initValidator(initData);
  return initData;
}

export function initFromCsv(): InitData {

  let initData: InitData = { sessions :  {}, allSessions: [] };

  describe("[Info-Widget-Init] Initialize from CSV files ", async () => {
    <Session>authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD);

    initData.sessions['Teacher'] = [];
    initData.sessions['Personnel'] = [];
    initData.sessions['Student'] = [];
    initData.sessions['Relative'] = [];

    // Collect all user credentials to authenticate in batch
    const userRecords: Array<{userInfo: string[], type: string}> = [];
    
    for(let i = 1; i < teachersRecords.length && i < 10; i++) {
      userRecords.push({userInfo: teachersRecords[i], type: 'Teacher'});
    }

    for(let i = 1; i < personnelsRecords.length; i++) {
      userRecords.push({userInfo: personnelsRecords[i], type: 'Personnel'});
    }

    for(let i = 1; i < studentsRecords.length; i++) {
      userRecords.push({userInfo: studentsRecords[i], type: 'Student'});
    }

    for(let i = 1; i < relativesRecords.length; i++) {
      userRecords.push({userInfo: relativesRecords[i], type: 'Relative'});
    }

    console.log(`Authenticating ${userRecords.length} users in batches of ${authBatchSize}...`);

    let successCount = 0;

    // Process users in chunks of authBatchSize
    for (let batchStart = 0; batchStart < userRecords.length; batchStart += authBatchSize) {
      const batchEnd = Math.min(batchStart + authBatchSize, userRecords.length);
      const batchRecords = userRecords.slice(batchStart, batchEnd);

      // Prepare batch login requests for this chunk
      const loginRequests = {};
      batchRecords.forEach((record, index) => {
        const userInfo = record.userInfo;
        loginRequests[`user_${index}`] = {
          method: 'POST',
          url: `${BASE_URL}/auth/login`,
          body: {
            email: userInfo[1],
            password: userInfo[2] || __ENV.DEFAULT_PASSWORD || "password",
            callBack: "",
            detail: "",
          },
          params: {
            redirects: 0,
          }
        };
      });

      // Execute this batch in parallel
      const responses = http.batch(loginRequests);

      // Process responses and create sessions
      Object.keys(responses).forEach((key) => {
        const index = parseInt(key.split('_')[1]);
        const response = responses[key];
        const record = batchRecords[index];
        const userInfo = record.userInfo;

        if (response.status !== 302 || !response.cookies["oneSessionId"]) {
          console.log("Unable to create session for ", userInfo[1], "- Status:", response.status);
          return;
        }

        const cookies: Cookie[] = Object.keys(response.cookies).map(
          (cookieName) => {
            return {
              name: cookieName,
              value: response.cookies[cookieName][0].value,
            };
          },
        );

        const session = new Session(
          response.cookies["oneSessionId"][0].value,
          SessionMode.COOKIE,
          THIRTY_MINUTES_IN_SECONDS,
          cookies,
        );

        const user: InfoUser = {
          login: userInfo[1],
          profile: userInfo[3],
          session: session,
          role: userInfo[4],
          threadId: userInfo[5],
          isValidator: false
        };

        initData.sessions[record.type].push(user);
        initData.allSessions.push(user);
        successCount++;
      });

      console.log(`Batch ${Math.floor(batchStart / authBatchSize) + 1}: authenticated ${batchEnd}/${userRecords.length} users`);
    }

    console.log(`Successfully authenticated ${successCount}/${userRecords.length} users`);
  });
  initValidator(initData);
  return initData;
}

function initValidator(data: InitData) {
  const users = data.allSessions
      .filter((user: InfoUser) => user.role === 'PUBLISHER');
  const user = users[0];
  user.isValidator = true;
  switchSession(user.session);

  //create * 2 pending info and assume a 1 min duration for the scenario to limit throughput

  const totalVu = Math.floor((parseDuration(duration) / 1000) * pendingVus / 20);

  for (let i = 0; i < totalVu; i++) {
    //pending should not be visible
    createInfoOrFail({
      title: `Incoming info`,
      content: `Incoming content`,
      thread_id: parseInt(user.threadId as string),
      status: 2,
      publication_date: "2020-01-01T00:00:00Z",
    } as any);
  }
}

function parseDuration(input: string): number {
  const match = input.match(/^(\d+)(ms|s|m|h)$/);

  if (!match) {
    throw new Error("Format invalide");
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "ms": return value;
    case "s":  return value * 1000;
    case "m":  return value * 60 * 1000;
    case "h":  return value * 60 * 60 * 1000;
  }
  return 0;
}