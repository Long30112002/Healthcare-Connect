# 🏥 Healthcare Connect

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/SpringBoot-3-success)
![React](https://img.shields.io/badge/React-Frontend-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-informational)
![JWT](https://img.shields.io/badge/Auth-JWT-red)
![WebSocket](https://img.shields.io/badge/Realtime-WebSocket-purple)

> Healthcare Connect là một hệ thống Telemedicine toàn diện, kết nối trực tiếp Bệnh nhân, Bác sĩ và Cơ sở y tế. Hệ thống không chỉ dừng lại ở việc đặt lịch mà còn ứng dụng trí tuệ nhân tạo (AI) để hỗ trợ người dùng đặt lịch và quản lý quy trình vận hành y tế một cách chuyên nghiệp.

---

# Giới thiệu

Healthcare Connect là hệ thống hỗ trợ kết nối giữa:
- Bệnh nhân: Tìm kiếm bác sĩ, đặt lịch khám, thanh toán và quản lý hồ sơ sức khỏe cá nhân.
- Bác sĩ: Quản lý lịch hẹn, thực hiện tư vấn và cập nhật bệnh án điện tử cho bệnh nhân.
- Lễ tân: Tiếp đón, đặt lịch và thực hiện check-in cho bệnh nhân tại quầy và điều phối luồng khám bệnh.
- Quản lý bệnh viện: Quản lý danh sách bác sĩ, chuyên khoa và theo dõi báo cáo doanh thu, hiệu suất.
- Admin: Kiểm duyệt toàn bộ cơ sở y tế, cấu hình hệ thống và giám sát hoạt động qua Audit Log.

Thông qua:
- Đặt lịch khám online: * Tìm kiếm bác sĩ theo chuyên khoa, giá khám và khung giờ trống.
Tự động khóa slot khám khi đang xử lý thanh toán để tránh đặt trùng lịch (Race Condition).
- Check in lịch khám: * Lễ tân xác thực mã lịch hẹn và đổi trạng thái sang "Chờ khám" ngay khi bệnh nhân có mặt tại bệnh viện.
Tự động thông báo đến bác sĩ thông qua hệ thống để chuẩn bị tiếp nhận ca khám.
- Quản lý bệnh án điện tử: * Lưu trữ lịch sử khám bệnh, đơn thuốc, kết quả xét nghiệm và ghi chú của bác sĩ một cách bảo mật.
Cho phép bệnh nhân tra cứu lịch sử bệnh lý mọi lúc mọi nơi trên nền tảng.
- Thanh toán/hoàn tiền trực tuyến: * Tích hợp cổng thanh toán MoMo, xử lý giao dịch tự động 24/7.
Cơ chế hoàn tiền: Tự động tính toán tỷ lệ hoàn tiền (ví dụ: 100%, 50%) dựa trên thời điểm bệnh nhân yêu cầu hủy lịch so với giờ khám.
- Gợi ý đặt chuyên khoa bằng AI: * Sử dụng Gemini AI để phân tích triệu chứng bệnh nhân nhập vào.
Tự động đề xuất các chuyên khoa phù hợp nhất, giúp bệnh nhân chọn đúng bác sĩ cần gặp.
- Theo dõi lịch khám realtime: * Sử dụng WebSocket để cập nhật trạng thái thanh toán và số thứ tự khám hiện tại theo thời gian thực.
Hệ thống gửi thông báo nhắc lịch tự động qua Email/RabbitMQ trước giờ khám để giảm tỷ lệ bỏ lịch.

---

# 🚀 Chức năng chính

<table>
<tr>
<td width="50%">

## 👤 Bệnh nhân
- Đặt lịch khám
- AI phân tích triệu chứng
- Thanh toán MoMo
- Quản lý hồ sơ sức khỏe
- Hoàn tiền khi hủy lịch

</td>

<td width="50%">

## 👨‍⚕️ Bác sĩ
- Quản lý lịch khám
- Cập nhật bệnh án
- Tư vấn bệnh nhân
- Theo dõi đánh giá

</td>
</tr>

<tr>
<td width="50%">

## 🏥 Hospital Manager
- Duyệt bác sĩ
- Quản lý chuyên khoa
- Theo dõi doanh thu
- Quản lý dịch vụ y tế

</td>

<td width="50%">

## 🛡️ Admin
- Quản lý hệ thống
- Audit Log
- Quản lý cấu hình
- Kiểm duyệt tài khoản

</td>
</tr>
</table>

---

# 🏗 Kiến trúc hệ thống

```text
API Layer
Application Layer
Domain Layer
Infrastructure Layer
