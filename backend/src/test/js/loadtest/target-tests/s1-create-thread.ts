import { describe } from "https://jslib.k6.io/k6chaijs/4.3.4.0/index.js";

import {
  getHeaders,
  switchSession,
  Session,
  UserInfo
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
import { threadAllRights } from "../../utils/_thread-utils.ts";

const rootUrl = __ENV.ROOT_URL;
const baseDelay = (__ENV.DELAY_BETWEEN_PAGE_IN_MS ? Number(__ENV.DELAY_BETWEEN_PAGE_IN_MS) : 1000) ;

const totalUser = new Counter("total_users_s1");

export function s1CreateThread(data: InitData) {

  describe('[s1-Create-Thread] Test scenario s1 access to actualites create a thread', () => {

    const users = data.sessions['Teacher']
      .filter((user: InfoUser) => user.role === 'CONTRIBUTOR' || user.role === 'PUBLISHER');

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
    sleep(baseDelay / 5000);

    //retreive user info
    const userInfoUrl = `${rootUrl}/auth/oauth2/userinfo`;
    const resUserInfo =  http.get(userInfoUrl,
      { headers: getHeaders(), tags: {type: 'user_info'} });

    const userInfo : UserInfo = JSON.parse(resUserInfo.body as string);

    //create thread
    const resThread =  http.post(
      `${rootUrl}/actualites/api/v1/threads`,
      JSON.stringify({
        title: `New thread ${exec.scenario.iterationInInstance}`,
        mode: 0,
        structure: {
          id: `${userInfo.structures[0]}`
        }
      } ),
      { headers: getHeaders(), tags: {type: 'create_thread'} });

    const threadId : Identifier = JSON.parse(resThread.body as string);
    pushResponseMetrics(resThread, user);
    sleep(baseDelay / 1000);

    const searchShareUrl = `${rootUrl}/actualites/api/v1/threads/${threadId.id}/shares?search=`;

    let shares: any[] = [];

    //search parent group
    let resSearchParent = http.get(searchShareUrl + 'relative', {
      headers: getHeaders(),
      tags: {type : 'list_info_shares'}
    });
    pushResponseMetrics(resSearchParent, user);

    let shareResult: Shares = JSON.parse(resSearchParent.body as string);
    let groups  = shareResult.groups.visibles.filter(g => !g.structureName && g.name.endsWith('Relative'));

    for(let group of groups) {
      shares.push(group);
    }
    sleep(baseDelay / 1000);
    //search personnel group
    resSearchParent = http.get(searchShareUrl + 'personnel', {
      headers: getHeaders(),
      tags: {type : 'list_info_shares'}
    });
    pushResponseMetrics(resSearchParent, user);

    shareResult = JSON.parse(resSearchParent.body as string);
    groups = shareResult.groups.visibles.filter(g => !g.structureName && g.name.endsWith('Personnel'));
    for(let group of groups) {
      shares.push(group);
    }

    sleep(baseDelay / 1000);

    //search teacher group
    resSearchParent = http.get(searchShareUrl + 'teacher', {
      headers: getHeaders(),
      tags: {type : 'list_info_shares'}
    });
    pushResponseMetrics(resSearchParent, user);

    let groupsShare: Shares = {users: {}, groups: {}, sharedBookmarks: {}};

    for(let g of shares) {
      groupsShare = addGroupSharesInfos(groupsShare, g.id, threadAllRights);
    }
    //share info
    const shareResponse = http.put(`${rootUrl}/actualites/api/v1/threads/${threadId.id}/shares`,
      JSON.stringify(groupsShare),
      { headers: getHeaders(), tags: {type: 'update_thread_shares'} });
    pushResponseMetrics(shareResponse, user);

    //too simulate very few user we need to add a substantial delay
    sleep(50 * baseDelay / 1000);
    });
}
