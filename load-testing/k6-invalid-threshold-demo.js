import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p95<200'],
  },
};

export default function () {
  const res = http.get('http://127.0.0.1:3000/users');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
