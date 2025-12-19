import { InitData, initFromCsv, initLocal } from "./_init-test-utils.ts";
import { s6ReadOldInfo } from "../target-tests/s6-read-old-info.ts";
import { s7CommentInfo } from "../target-tests/s7-comment-info.ts";
import { s1CreateThread } from "../target-tests/s1-create-thread.ts";

const schoolName = __ENV.DATA_SCHOOL_NAME || `Load tests average load`;
const constantVu =  Number.parseInt(__ENV.CONSTANT_VU || '150');
const duration = __ENV.DURATION || '1m';
const env = __ENV.ENVIRONMENT || 'local';

export const threadCreationVus =  Math.floor(constantVu / 3000) !== 0 ? Math.floor(constantVu / 3000) : 1;

export const options = {
  setupTimeout: "1h",
  thresholds: {
    checks: ["rate == 1.00"],
    // add threshold empty to export metrics by url
    'http_req_duration{type:list_info}': [],
    'http_req_duration{type:list_thread}': [],
    'http_req_duration{type:stats}': [],
    'http_req_duration{type:get_info}': [],
    'http_req_duration{type:widget_access}': [],
    'http_req_duration{type:create_comment}': [],
    'http_req_duration{type:create_thread}': [],
    'http_req_duration{type:update_thread_shares}': [],
    'http_req_duration{type:list_info_shares}': []
  },
  scenarios: {
    ramp_up_read_old_info: {
      executor: 'ramping-vus',
      exec: 'readOldInfos',
      startVUs: 0,
      stages: [
        { duration: '30s', target: constantVu / 2 }, // montée progressive
        { duration: duration, target: constantVu / 2 }, // plateau stable
        { duration: '5s', target: 0 }, // descente propre (facultatif)
      ],
      gracefulRampDown: '5s',
    },
    ramp_up_comment_info: {
      executor: 'ramping-vus',
      exec: 'commentInfo',
      startVUs: 0,
      stages: [
        { duration: '30s', target: constantVu / 2 }, // montée progressive
        { duration: duration, target: constantVu / 2 }, // plateau stable
        { duration: '5s', target: 0 }, // descente propre (facultatif)
      ],
      gracefulRampDown: '5s',
    },
    ramp_up_create_thread: {
      executor: 'ramping-vus',
      exec: 'createThread',
      startVUs: 0,
      stages: [
        { duration: '30s', target: threadCreationVus }, // montée progressive
        { duration: duration, target: threadCreationVus }, // plateau stable
        { duration: '5s', target: 0 }, // descente propre (facultatif)
      ],
      gracefulRampDown: '5s',
    },
  },
};


export function setup() {
  if(env === 'local') {
    return initLocal(schoolName);
  } else {
    return initFromCsv();
  }
}

export function readOldInfos(data: InitData) {
  s6ReadOldInfo(data);
}

export function commentInfo(data: InitData) {
  s7CommentInfo(data);
}

export function createThread(data: InitData) {
  s1CreateThread(data);
}
