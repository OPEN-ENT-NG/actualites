import { Trend, Counter } from 'k6/metrics';

export const apiTrend = new Trend('api_time');
export const apiErrors = new Counter('api_errors');
export const apiSuccesses = new Counter('api_successes');