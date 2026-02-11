import { InitData, initFromCsv, initLocal } from "./_init-test-utils.ts";
import { s9Widget } from "../target-tests/s9-widget.ts";
import { s4ReadInfo } from "../target-tests/s4-read-info.ts";
import { s2CreateInfo } from "../target-tests/s2-create-info.ts";
import { s3ValidateInfo } from "../target-tests/s3-validate-info.ts";

const schoolName = __ENV.DATA_SCHOOL_NAME || `Load tests average load`;
const constantVu =  Number.parseInt(__ENV.CONSTANT_VU || '150');
const duration = __ENV.DURATION || '1m';
const env = __ENV.ENVIRONMENT || 'local';

export const pendingVus =  Math.floor(constantVu / 3000) !== 0 ? Math.floor(constantVu / 3000) : 1;
export const createVus =  Math.floor(constantVu / 150) !== 0 ? Math.floor(constantVu / 150) : 1;

export const options = {
  setupTimeout: "1h",
  thresholds: {
    checks: ["rate == 1.00"],
    // add threshold empty to export metrics by url
    'http_req_duration{type:create_draft}': [],
    'http_req_duration{type:get_info}': [],
    'http_req_duration{type:get_rights_mapping}': [],
    'http_req_duration{type:list_info}': [],
    'http_req_duration{type:list_info_shares}': [],
    'http_req_duration{type:list_thread}': [],
    'http_req_duration{type:published_info}': [],
    'http_req_duration{type:search_personnel}': [],
    'http_req_duration{type:search_teacher}': [],
    'http_req_duration{type:stats}': [],
    'http_req_duration{type:submit_info}': [],
    'http_req_duration{type:update_info_shares}': [],
    'http_req_duration{type:widget_access}': [],
  },
  scenarios: {
    
    ramp_up_widget: {
      executor: 'ramping-vus',
      exec: 'averageWidget',
      startVUs: 0,
      stages: [
        { duration: '30s', target: constantVu }, // montée progressive
        { duration: duration, target: constantVu }, // plateau stable
        { duration: '10s', target: 0 }, // descente propre (facultatif)
      ],
      gracefulRampDown: '10s',
    },
    ramp_up_read_info: {
      executor: 'ramping-vus',
      exec: 'readInfo',
      startVUs: 0,
      stages: [
        { duration: '30s', target: constantVu }, // montée progressive
        { duration: duration, target: constantVu }, // plateau stable
        { duration: '10s', target: 0 }, // descente propre (facultatif)
      ],
      gracefulRampDown: '10s',
    },
    ramp_up_create_info: {
      executor: 'ramping-vus',
      exec: 'createInfo',
      startVUs: 0,
      stages: [
        { duration: '30s', target: createVus }, // montée progressive
        { duration: duration, target: createVus }, // plateau stable
        { duration: '10s', target: 0 }, // descente propre (facultatif)
      ],
      gracefulRampDown: '10s',
    },
    ramp_up_validate_info: {
      executor: 'ramping-vus',
      exec: 'validateInfo',
      startVUs: 0,
      stages: [
        { duration: '30s', target: pendingVus}, // montée progressive
        { duration: duration, target: pendingVus}, // plateau stable
        { duration: '10s', target: 0 }, // descente propre (facultatif)
      ],
      gracefulRampDown: '10s',
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

export function averageWidget(data: InitData) {
  s9Widget(data);
}

export function readInfo(data: InitData) {
  s4ReadInfo(data);
}

export function createInfo(data: InitData) {
  s2CreateInfo(data);
}

export function validateInfo(data: InitData) {
  s3ValidateInfo(data);
}