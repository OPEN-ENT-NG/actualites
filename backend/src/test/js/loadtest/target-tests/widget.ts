import { describe } from "https://jslib.k6.io/k6chaijs/4.3.4.0/index.js";

import {
  getHeaders,
  switchSession,
  Session
} from '../../node_modules/edifice-k6-commons/dist/index.js';
import { InitData } from "./_init-test-utils.ts";
import {sleep} from "k6";
import http from "k6/http";
import exec from 'k6/execution';
import { apiErrors, apiSuccesses, apiTrend } from "../scenarios/_metrics-utils.ts";

const rootUrl = __ENV.ROOT_URL;
const baseDelay = (__ENV.DELAY_BETWEEN_PAGE_IN_MS ? Number(__ENV.DELAY_BETWEEN_PAGE_IN_MS) : 1000) ;

export function s9Widget(data: InitData) {

  describe('[Info-Widget] Test standard scenario widget access', () => {

    const randomIndex = exec.scenario.iterationInInstance % data.allSessions.length;

    const user = data.allSessions[randomIndex];
    const session = Session.from(user.session);
    switchSession(session);

    const url = `${rootUrl}/actualites/api/v1/infos/preview/last/4`;
    const res = http.get(url, { headers: getHeaders() });

    apiTrend.add(res.timings.duration, {profile: user.profile});
    if(res.status < 300 && res.status >= 200) {
      apiSuccesses.add(1);
    } else {
      apiErrors.add(1);
    }
    sleep(baseDelay / 1000);
  });
}
