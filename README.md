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
- Đặt lịch khám online: Tìm kiếm bác sĩ theo chuyên khoa, giá khám và khung giờ trống. Tự động khóa slot khám khi đang xử lý thanh toán để tránh đặt trùng lịch (Race Condition).
- Check in lịch khám: Lễ tân xác thực mã lịch hẹn và đổi trạng thái sang "Chờ khám" ngay khi bệnh nhân có mặt tại bệnh viện. Tự động thông báo đến bác sĩ thông qua hệ thống để chuẩn bị tiếp nhận ca khám.
- Quản lý bệnh án điện tử: Lưu trữ lịch sử khám bệnh, đơn thuốc, kết quả xét nghiệm và ghi chú của bác sĩ một cách bảo mật. Cho phép bệnh nhân tra cứu lịch sử bệnh lý mọi lúc mọi nơi trên nền tảng.
- Thanh toán/hoàn tiền trực tuyến: Tích hợp cổng thanh toán MoMo, xử lý giao dịch tự động 24/7. Cơ chế hoàn tiền: Tự động tính toán tỷ lệ hoàn tiền (ví dụ: 100%, 50%) dựa trên thời điểm bệnh nhân yêu cầu hủy lịch so với giờ khám.
- Gợi ý đặt chuyên khoa bằng AI: Sử dụng AI để phân tích triệu chứng bệnh nhân nhập vào. Tự động đề xuất các chuyên khoa phù hợp nhất, giúp bệnh nhân chọn đúng bác sĩ cần gặp.
- Theo dõi lịch khám realtime: Sử dụng WebSocket để cập nhật trạng thái thanh toán và số thứ tự khám hiện tại theo thời gian thực.

---

# Chức năng chính

<table align="center" width="100%">
<tr>
<td width="50%" valign="top">

<h3 align="center">Bệnh nhân</h3>

- Đặt lịch khám online
- AI phân tích triệu chứng và gợi ý chuyên khoa
- Tìm kiếm bác sĩ theo chuyên khoa, giá khám và thời gian trống
- Thanh toán trực tuyến qua MoMo
- Theo dõi trạng thái thanh toán realtime
- Hủy lịch và hoàn tiền tự động
- Quản lý hồ sơ sức khỏe điện tử
- Xem lịch sử khám bệnh và toa thuốc
- Nhận email/thông báo nhắc lịch khám
- Đánh giá bác sĩ sau khi khám

</td>

<td width="50%" valign="top">

<h3 align="center">Bác sĩ</h3>

- Đăng ký bác sĩ và cập nhật hồ sơ chuyên môn
- Upload chứng chỉ hành nghề
- Quản lý lịch khám và thời gian làm việc
- Theo dõi danh sách bệnh nhân
- Tư vấn và cập nhật bệnh án điện tử
- Kê toa thuốc và ghi chú điều trị
- Theo dõi đánh giá từ bệnh nhân
- Xem thống kê hiệu suất khám bệnh
- Quản lý trạng thái lịch hẹn
- Xem lịch sử tư vấn và điều trị

</td>
</tr>

<tr>
<td width="50%" valign="top">

<h3 align="center">Lễ tân</h3>

- Đăng ký lễ tân và cập nhật hồ sơ chuyên môn
- Xác nhận check-in bệnh nhân
- Hỗ trợ tạo lịch khám trực tiếp tại quầy
- Quản lý hàng đợi khám bệnh
- Cập nhật trạng thái lịch hẹn
- Kiểm tra thanh toán của bệnh nhân
- Hỗ trợ bệnh nhân hủy hoặc đổi lịch
- In thông tin lịch khám
- Quản lý danh sách bệnh nhân trong ngày
- Hỗ trợ hướng dẫn bệnh nhân

</td>

<td width="50%" valign="top">

<h3 align="center">Hospital Manager</h3>

- Duyệt hồ sơ bác sĩ/lễ tân
- Quản lý chuyên khoa và dịch vụ y tế
- Quản lý danh sách bác sĩ thuộc bệnh viện
- Theo dõi doanh thu bệnh viện
- Xem thống kê số lượng ca khám
- Theo dõi hiệu suất bác sĩ
- Quản lý lịch làm việc bác sĩ
- Quản lý giá khám và phí dịch vụ
- Theo dõi báo cáo hoạt động bệnh viện

</td>
</tr>

<tr>
<td width="50%" valign="top">

<h3 align="center">Admin</h3>

- Quản lý toàn bộ hệ thống
- Kiểm duyệt tài khoản Manager và Doctor
- Quản lý cấu hình hệ thống
- Theo dõi Audit Log
- Quản lý trạng thái bảo trì hệ thống
- Theo dõi hoạt động người dùng
- Quản lý phân quyền và role
- Theo dõi thống kê hệ thống
- Kiểm soát dữ liệu và nội dung hệ thống

</td>

<td width="50%" valign="top">

<h3 align="center">Tính năng kỹ thuật</h3>

- JWT Authentication
- Role-based Authorization
- Real-time Notification với WebSocket
- Email Queue với RabbitMQ
- Rate Limiting với Bucket4j
- Database Migration với Flyway
- Cloud Storage với Cloudinary / MinIO
- Audit Logging
- Refund Calculation Logic
- AI Symptom Analysis với Gemini AI

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
