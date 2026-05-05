import http from "k6/http";
import { check, sleep } from "k6";

// Load test configuration
export let options = {
  stages: [
    { duration: "45s", target: 1000 },
    { duration: "30s", target: 2000 }, 
    { duration: "30s", target: 1500 }, 
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests under 500ms
    http_req_failed: ["rate<0.1"], // Error rate under 10%
  },
};

// Replace with your actual ALB DNS name
const BASE_URL =
  "http://notes-backend-alb-141272784.ap-south-1.elb.amazonaws.com";

export default function () {
  // Test health endpoint (lightweight)
  let healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    "health check status is 200": (r) => r.status === 200,
    "health check response time < 500ms": (r) => r.timings.duration < 500,
  });

  // Simulate user think time
  sleep(1);
}
