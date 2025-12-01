import { InitData, initFromCsv, initLocal } from "./_init-test-utils.ts";
import { s9Widget } from "../target-tests/widget.ts";

const schoolName = __ENV.DATA_SCHOOL_NAME || `Load tests average load`;
const constantVu = __ENV.CONSTANT_VU || 150;
const duration = __ENV.DURATION || '1m';
const env = __ENV.ENVIRONMENT || 'local';

export const options = {
  setupTimeout: "1h",
  thresholds: {
    checks: ["rate == 1.00"],
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
      gracefulRampDown: '1s',
    }
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
