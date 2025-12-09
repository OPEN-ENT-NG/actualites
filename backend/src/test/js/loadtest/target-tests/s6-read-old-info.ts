import { describe } from "https://jslib.k6.io/k6chaijs/4.3.4.0/index.js";

import {
  getHeaders,
  switchSession,
  Session
} from '../../node_modules/edifice-k6-commons/dist/index.js';
import { InitData } from "./_init-test-utils.ts";
import { sleep, check } from "k6";
import http from "k6/http";
import exec from 'k6/execution';
import { pushResponseMetrics } from "../scenarios/_metrics-utils.ts";
import { Counter } from "k6/metrics";
import { Identifier } from "../../utils/_info-utils.ts";

const rootUrl = __ENV.ROOT_URL;
const baseDelay = (__ENV.DELAY_BETWEEN_PAGE_IN_MS ? Number(__ENV.DELAY_BETWEEN_PAGE_IN_MS) : 1000) ;

const totalUser = new Counter("total_users_s6");

export function s6ReadOldInfo(data: InitData) {

  describe('[s6-Read-Old-Info] Test scenario s6 access to actualites read some old infos', () => {

    const randomIndex = exec.scenario.iterationInInstance % data.allSessions.length;

    const user = data.allSessions[randomIndex];
    const session = Session.from(user.session);
    switchSession(session);
    totalUser.add(1);

    const widgetUrl = `${rootUrl}/actualites/api/v1/infos/preview/last/4`;
    const res = http.get(widgetUrl,
      { headers: getHeaders(), tags:{ type: 'widget_access'} });
    //handle metrics
    pushResponseMetrics(res, user);

    sleep(baseDelay / 1000);

    const infos = JSON.parse(res.body as string);
    if(!infos || infos.length === 0) {
      console.error('user in dataset not correct', user);
      return;
    }
    const infoIds = infos.map((info: Identifier) => info.id);

    //display interface actualites
    const listInfoUrl = `${rootUrl}/actualites/api/v1/infos`;
    let resListInfo = http.get(listInfoUrl,
      { headers: getHeaders(), tags: {type : 'list_info'} });
    pushResponseMetrics(resListInfo, user);
    // short delay to simulate succession of call from browser
    sleep(baseDelay / 5000);
    const infosList = JSON.parse(res.body as string);

    check(infosList, {
      "Infos list should not be empty": (list) => Array.isArray(list) && list.length !== 0,
    });

    //display thread list
    const listThreadUrl = `${rootUrl}/actualites/api/v1/threads`;
    const resListThread = http.get(listThreadUrl,
      { headers: getHeaders(), tags: {type : 'list_thread'} });
    pushResponseMetrics(resListThread, user);
    sleep(baseDelay / 5000);

    //display stats
    const statsUrl = `${rootUrl}/actualites/api/v1/infos/stats`;
    const resStats = http.get(statsUrl, { headers: getHeaders(),
      tags: {type : 'stats'}});
    pushResponseMetrics(resStats, user);
    sleep(baseDelay / 5000);

    //browse old actualites list
    for(let i = 0; i < 3; i++) {
      resListInfo = http.get(`${listInfoUrl}?pageSize=20&page=${i}`,
        { headers: getHeaders(), tags: {type : 'list_info'} });
      pushResponseMetrics(resListInfo, user);
      sleep(2 * baseDelay / 1000);
    }

    //display some infos
    for(let i = 0; i < 5; i++) {
      const infoUrl = `${rootUrl}/actualites/api/v1/infos/${infoIds[i]}`;
      const resInfo = http.get(infoUrl, {
        headers: getHeaders(),
        tags: { type: 'get_info' }
      });
      pushResponseMetrics(resInfo, user);
      sleep(baseDelay / 1000);
    }
  });
}
