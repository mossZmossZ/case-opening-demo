import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:8080';

export const options = {
  // Small smoke load: ramp to 5 VUs over 30s total. Enough to catch obvious
  // regressions (5xx, timeouts, broken routing) without hammering CI.
  stages: [
    { duration: '10s', target: 5 },
    { duration: '15s', target: 5 },
    { duration: '5s',  target: 0 },
  ],
  thresholds: {
    http_req_failed:   ['rate<0.01'],   // <1% errors
    http_req_duration: ['p(95)<800'],   // p95 under 800ms on CI runner
  },
};

export default function () {
  // Front page (served by nginx)
  const landing = http.get(`${BASE}/`);
  check(landing, { 'landing 200': (r) => r.status === 200 });

  // Public game endpoints (proxied through nginx → game-service)
  const stats = http.get(`${BASE}/api/game/stats`);
  check(stats, {
    'stats 200':         (r) => r.status === 200,
    'stats has counts':  (r) => r.json('totalOpens') !== undefined,
  });

  const leaderboard = http.get(`${BASE}/api/game/leaderboard`);
  check(leaderboard, { 'leaderboard 200': (r) => r.status === 200 });

  sleep(1);
}
