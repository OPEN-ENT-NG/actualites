import { InitData, initFromCsv, initLocal } from "./_init-test-utils.ts";
import { s9Widget } from "../target-tests/widget.ts";

const schoolName = __ENV.DATA_SCHOOL_NAME || `Load tests average load`;
const constantVu = __ENV.CONSTANT_VU || 150;
const duration = __ENV.DURATION || '1m';
const env = __ENV.ENVIRONMENT || 'Local';

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
        { duration: '30s', target: constantVu }, // ramp-up
      ],
      gracefulRampDown: '0s',
    },
    constant_load_widget: {
      executor: 'constant-vus',
      exec: 'averageWidget',
      vus: constantVu,// charge constante
      duration: duration,
      startTime: '31s', // démarre après la fin du ramp-up
      gracefulStop: '3s', //evite les erreurs sur la fin laisse les scénarios se terminer
    }
  },
};


export function setup() {
  if(env === 'Local') {
    return initLocal(schoolName);
  } else {
    return initFromCsv();
  }
}

export function averageWidget(data: InitData) {
   s9Widget(data);
}
