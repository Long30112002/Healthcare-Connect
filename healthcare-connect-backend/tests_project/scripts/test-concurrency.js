import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
    // 100 Virtual Users cùng "dội bom"
    vus: 100, 
    // Chạy trong 10 giây để xem ai nhanh tay hơn
    duration: '10s', 
};

// BƯỚC 1: SETUP - Chạy 1 lần duy nhất trước khi test bắt đầu
export function setup() {
    const tokens = [];
    const loginUrl = 'http://localhost:8080/api/auth/login';

    for (let i = 1; i <= 100; i++) {
        const payload = JSON.stringify({
            email: `user${i}@gmail.com`,
            password: 'password123'
        });
        const res = http.post(loginUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        // SỬA TẠI ĐÂY: Trích xuất đúng key từ JSON của bạn
        const token = res.json('data.accessToken'); 
        
        if (token) {
            tokens.push(token);
        } else {
            console.log(`User ${i} login thất bại. Body: ${res.body}`);
        }
    }

    console.log(`--- Đã chuẩn bị xong ${tokens.length} Token ---`);
    return { tokens: tokens };
}

// BƯỚC 2: VÒNG LẶP CHÍNH - Các VU chỉ việc lấy Token ra và Book
export default function (data) {
    // Mỗi VU sẽ lấy 1 Token tương ứng từ danh sách trong data.tokens
    const token = data.tokens[__VU - 1]; 
    
    if (!token) return;

    const bookUrl = 'http://localhost:8080/api/appointments/book';
    const bookPayload = JSON.stringify({
        scheduleId: 'd2630814-2559-4bf9-9489-7753acddbe3f',
        symptoms: `Chiến thần tốc độ - User ${__VU}`
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    };

    const res = http.post(bookUrl, bookPayload, params);

    check(res, {
        'Thành công (200)': (r) => r.status === 200,
        'Hết chỗ (400)': (r) => r.status === 400,
    });

    // Không sleep hoặc sleep cực ngắn để tạo áp lực tối đa
    sleep(0.1);
}

export function handleSummary(data) {
   return { "report_optimized.html": htmlReport(data) };
}