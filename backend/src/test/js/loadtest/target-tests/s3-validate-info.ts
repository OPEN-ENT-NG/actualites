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
import {InfoUser} from "../scenarios/_init-test-utils.ts";
import { Identifier, infoFullRights } from "../../utils/_info-utils.ts";
import { addGroupSharesInfos, Shares } from "../../utils/_shares_utils.ts";

const rootUrl = __ENV.ROOT_URL;
const baseDelay = (__ENV.DELAY_BETWEEN_PAGE_IN_MS ? Number(__ENV.DELAY_BETWEEN_PAGE_IN_MS) : 1000) ;

const totalUser = new Counter("total_users_s3");

export function s3ValidateInfo(data: InitData) {

  describe('[s3-Validate-Info] Test scenario s3 access to actualites validate an info', () => {

    const users = data.sessions['Teacher']
      .filter((user: InfoUser) => user.isValidator);

    const randomIndex = exec.scenario.iterationInInstance % users.length;
    const user = users[randomIndex];

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
    //display interface actualites
    const listInfoUrl = `${rootUrl}/actualites/api/v1/infos`;
    const resListInfo = http.get(listInfoUrl,
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
    sleep(baseDelay / 1000);

    //search an info to validate
    const listPendingInfoUrl = `${rootUrl}/actualites/api/v1/infos?status=PENDING`;
    const resListPendingInfo = http.get(listPendingInfoUrl,
      { headers: getHeaders(), tags: {type : 'list_info'} });
    pushResponseMetrics(resListInfo, user);
    // short delay to simulate succession of call from browser
    sleep(baseDelay / 5000);
    const infosPendingList = JSON.parse(resListPendingInfo.body as string);
    const infoId = infosPendingList[0].id;

    //update info
    const resInfo =  http.put(
      `${rootUrl}/actualites/api/v1/infos/${infoId}`,
      JSON.stringify({
        status: 3
      } ),
      { headers: getHeaders(), tags: {type: 'published_info'} });

    pushResponseMetrics(resInfo, user);
    sleep(55);
    });
}
