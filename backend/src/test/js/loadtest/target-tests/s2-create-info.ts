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
import { getInfoSharesOrFail, getRightsMappingOrFail, buildSharePayloadFromGroups, shareInfos } from "../../utils/_shares_utils.ts";

const rootUrl = __ENV.ROOT_URL;
const baseDelay = (__ENV.DELAY_BETWEEN_PAGE_IN_MS ? Number(__ENV.DELAY_BETWEEN_PAGE_IN_MS) : 1000) ;

const totalUser = new Counter("total_users_s2");

export function s2CreateInfo(data: InitData) {

  describe('[s2-Create-Info] Test scenario s2 access to actualites create an info', () => {

    const users = data.allSessions
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

    // 1. create draft info
    const resInfo = http.post(
      `${rootUrl}/actualites/api/v1/infos`,
      JSON.stringify({
        title: `Incoming info ${exec.scenario.iterationInInstance}`,
        content: `Incoming content`,
        thread_id: parseInt(user.threadId as string),
        status: 1,
        publication_date: new Date().toISOString()
      }),
      { headers: getHeaders(), tags: {type: 'create_draft'} }
    );

    check(resInfo, {
      "Create draft info should succeed": (r) => r.status === 200,
    });

    const infoId: Identifier = JSON.parse(resInfo.body as string);
    pushResponseMetrics(resInfo, user);
    sleep(baseDelay / 1000);

    const resGetInfo = http.get(
      `${rootUrl}/actualites/api/v1/infos/${infoId.id}`,
      { headers: getHeaders(), tags: {type: 'get_info'} }
    );
    check(resGetInfo, {
      "Get info should succeed": (r) => r.status === 200,
    });
    pushResponseMetrics(resGetInfo, user);
    sleep(baseDelay / 5000);

    // 2. share workflow
    // get rights mapping
    const resRightsMapping = http.get(
      `${rootUrl}/actualites/api/v1/rights/sharing`,
      { headers: getHeaders(), tags: {type: 'get_rights_mapping'} }
    );
    pushResponseMetrics(resRightsMapping, user);
    sleep(baseDelay / 5000);

    // get current shares for the info
    const resGetShares = http.get(
      `${rootUrl}/actualites/api/v1/infos/${infoId.id}/shares?search=`,
      { headers: getHeaders(), tags: {type: 'get_info_shares'} }
    );
    pushResponseMetrics(resGetShares, user);

    check(resGetShares, {
      "Get info shares should succeed": (r) => r.status === 200,
    });

    const shareResponse = JSON.parse(resGetShares.body as string);
    sleep(baseDelay / 1000);

    // build share payload from available groups
    const groupSuffixes = ['Relative', 'Student', 'Personnel', 'Teacher'];
    const sharePayload = buildSharePayloadFromGroups(shareResponse, groupSuffixes, infoFullRights);

    // Update shares
    const resUpdateShares = shareInfos(infoId.id.toString(), sharePayload);
    pushResponseMetrics(resUpdateShares, user);

    check(resUpdateShares, {
      "Update info shares should succeed": (r) => r.status === 200,
    });
    sleep(baseDelay / 1000);

    // reload info after share update
    const resGetInfoAfterShare = http.get(
      `${rootUrl}/actualites/api/v1/infos/${infoId.id}`,
      { headers: getHeaders(), tags: {type: 'get_info'} }
    );
    pushResponseMetrics(resGetInfoAfterShare, user);
    sleep(baseDelay / 5000);

    // 3. publish or Submit info
    // CONTRIBUTOR -> status 2 (PENDING), PUBLISHER -> status 3 (PUBLISHED)
    const targetStatus = user.role === 'PUBLISHER' ? 3 : 2;

    const resPublish = http.put(
      `${rootUrl}/actualites/api/v1/infos/${infoId.id}`,
      JSON.stringify({ status: targetStatus }),
      { headers: getHeaders(), tags: {type: targetStatus === 3 ? 'publish_info' : 'submit_info'} }
    );

    check(resPublish, {
      "Publish/Submit info should succeed": (r) => r.status === 200,
    });
    pushResponseMetrics(resPublish, user);
    sleep(baseDelay / 1000);

    // reload info after publish/submit
    const resGetInfoAfterPublish = http.get(
      `${rootUrl}/actualites/api/v1/infos/${infoId.id}`,
      { headers: getHeaders(), tags: {type: 'get_info'} }
    );
    pushResponseMetrics(resGetInfoAfterPublish, user);
    sleep(baseDelay / 5000);
  });
}
