import { InitData, initFromCsv, initLocal } from "./_init-test-utils.ts";
import { s9Widget } from "../target-tests/s9-widget.ts";
import { s4ReadInfo } from "../target-tests/s4-read-info.ts";

const schoolName = __ENV.DATA_SCHOOL_NAME || `Load tests average load`;
const constantVu = __ENV.CONSTANT_VU || 150;
const duration = __ENV.DURATION || '1m';
const env = __ENV.ENVIRONMENT || 'local';

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
  },
  scenarios: {
    ramp_up_widget: {
      executor: 'ramping-vus',
      exec: 'averageWidget',
      startVUs: 0,
      stages: [
        { duration: '30s', target: constantVu }, // montée progressive
        { duration: duration, target: constantVu }, // plateau stable
        { duration: '5s', target: 0 }, // descente propre (facultatif)
      ],
      gracefulRampDown: '5s',
    },
    ramp_up_read_info: {
      executor: 'ramping-vus',
      exec: 'stressTest',
      startVUs: 0,
      stages: [
        { duration: '30s', target: constantVu }, // montée progressive
        { duration: duration, target: constantVu }, // plateau stable
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

export function averageWidget(data: InitData) {
  s9Widget(data);
}

export function stressTest(data: InitData) {
  s4ReadInfo(data);
}
