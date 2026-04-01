import http from 'k6/http';
import { sleep, check } from 'k6';

// Sử dụng biến môi trường hoặc mặc định
const BASE_URL = __ENV.BASE_URL || 'https://test.k6.io';

export const options = {
    stages: [
        { duration: '30s', target: 20 }, // tăng dần lên 20 VU
        { duration: '1m', target: 20 },  // giữ 20 VU trong 1 phút
        { duration: '30s', target: 0 },  // giảm về 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'], // 95% request dưới 1000ms
    },
};

export default function () {
    const response = http.get(BASE_URL);
    check(response, {
        'status is 200': (r) => r.status === 200,
    });
    sleep(1); // mỗi VU nghỉ 1s giữa các lần lặp
}