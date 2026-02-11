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
import { pushResponseMetrics } from "../scenarios/_metrics-utils.ts";
import { Counter } from "k6/metrics";

const rootUrl = __ENV.ROOT_URL;
const baseDelay = (__ENV.DELAY_BETWEEN_PAGE_IN_MS ? Number(__ENV.DELAY_BETWEEN_PAGE_IN_MS) : 1000) ;

const totalUser = new Counter("total_users_s9");

export function s9Widget(data: InitData) {

  describe('[s9-Widget] scenario s9 widget access', () => {

    const randomIndex = exec.scenario.iterationInInstance % data.allSessions.length;

    const user = data.allSessions[randomIndex];
    const session = Session.from(user.session);
    switchSession(session);
    totalUser.add(1);

    const url = `${rootUrl}/actualites/api/v1/infos/preview/last/4`;
    const res = http.get(url,
      { headers: getHeaders(), tags:{ type: 'widget_access'} });

    try {
      let infos = JSON.parse(res.body as string);

      if (!infos || infos.length === 0) {
        console.error('user in dataset not correct', user);
        return;
      }
    } catch(e) {
      console.error('user in dataset not correct', user);
      console.error(res);
      console.error('Exception:', e);
      return;
    }

    pushResponseMetrics(res, user);
    sleep(baseDelay / 1000);
  });
}
