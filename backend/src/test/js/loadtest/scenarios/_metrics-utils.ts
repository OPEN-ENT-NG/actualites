import { Trend, Counter } from 'k6/metrics';
import { RefinedResponse } from "k6/http";
import { InfoUser } from "./_init-test-utils.ts";

export const apiTrend = new Trend('api_time');
export const apiErrors = new Counter('api_errors');
export const apiSuccesses = new Counter('api_successes');

export function pushResponseMetrics(response: RefinedResponse<any>, user: InfoUser) {
  apiTrend.add(response.timings.duration, {profile: user.profile});
  if(response.status < 300 && response.status >= 200) {
    apiSuccesses.add(1);
  } else {
    apiErrors.add(1);
  }
}