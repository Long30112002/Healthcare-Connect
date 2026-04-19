package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.NotificationMessage;
import com.hoanglong.healthcare_connect_backend.core.entity.*;
import com.hoanglong.healthcare_connect_backend.infrastructure.messaging.config.RabbitMQConfig;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.springframework.core.io.FileSystemResource;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j

public class MailService {
    private final JavaMailSender mailSender;
    private final RabbitTemplate rabbitTemplate;
    private final QRCodeService qrCodeService;
    private final SpringTemplateEngine templateEngine;


    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String mailFrom;

    // --- ĐẨY VÀO RABBITMQ ---
    private void pushToQueue(String to, String subject, String template, Map<String, Object> vars) {
        if (to == null || to.isEmpty()) {
            log.error("==> [QUEUE] Bỏ qua đẩy vào hàng chờ vì email người nhận bị NULL!");
            return;
        }
        NotificationMessage message = NotificationMessage.builder()
                .recipientEmail(to)
                .subject(subject)
                .templateName(template)
                .variables(vars)
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, message);
        log.info("==> [QUEUE] Đã đẩy mail '{}' tới {} vào hàng chờ", subject, to);
    }

    // NGHIỆP VỤ XÁC THỰC
    public void sendVerificationEmail(User user) {
        String verifyUrl = frontendUrl + "/verify?code=" + user.getVerificationCode();
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());
        variables.put("url", verifyUrl);

        String subject, message, buttonText;
        if (user.getRole() == UserRole.HOSPITAL_MANAGER) {
            subject = "Xác thực quyền Quản lý Bệnh viện - Healthcare Connect";
            message = "Bạn đã được chỉ định làm Quản lý Bệnh viện. Vui lòng nhấn nút bên dưới để xác thực tài khoản.";
            buttonText = "Kích hoạt quyền Quản lý";
        } else {
            subject = "Xác thực tài khoản Healthcare Connect";
            message = "Cảm ơn bạn đã đăng ký thành viên. Link xác thực có hiệu lực trong 24 giờ.";
            buttonText = "Xác thực tài khoản";
        }

        variables.put("message", message);
        variables.put("btnText", buttonText);
        pushToQueue(user.getEmail(), subject, "email-template", variables);
    }

    // NGHIỆP VỤ QUÊN MẬT KHẨU
    public void sendForgotPasswordEmail(User user) {
        String resetUrl = frontendUrl + "/reset-password?code=" + user.getVerificationCode();
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());
        variables.put("url", resetUrl);
        variables.put("message", "Chúng tôi nhận được yêu cầu đặt lại mật khẩu của bạn. Link này có hiệu lực trong 30 phút.");
        variables.put("btnText", "Đặt lại mật khẩu");

        this.pushToQueue(user.getEmail(), "Yêu cầu đặt lại mật khẩu", "email-template", variables);
    }

//    // NGHIỆP VỤ XÁC THỰC HỒ SƠ BÁC SĨ
//    public void sendDoctorVerifiedEmail(User user, Doctor doctor) {
//        Map<String, Object> variables = new HashMap<>();
//        variables.put("name", user.getFullName());
//        variables.put("doctorCode", doctor.getDoctorCode());
//        variables.put("hospitalName", doctor.getHospital() != null ? doctor.getHospital().getName() : "Đang cập nhật");
//        variables.put("message", "Hồ sơ của bạn đã được Admin xác thực thành công. Vui lòng chờ bệnh viện tiếp nhận.");
//        variables.put("url", frontendUrl + "/doctor/profile");
//        variables.put("btnText", "Xem hồ sơ");
//
//        pushToQueue(user.getEmail(), "Hồ sơ bác sĩ đã được xác thực", "doctor-verified-template", variables);
//    }
//
//    // NGHIỆP VỤ DUYỆT BÁC SĨ
//    public void sendDoctorApprovalEmail(User user, Doctor doctor) {
//        Map<String, Object> variables = new HashMap<>();
//        variables.put("name", user.getFullName());
//        variables.put("doctorCode", doctor.getDoctorCode());
//        variables.put("hospitalName", doctor.getHospital() != null ? doctor.getHospital().getName() : "Đang cập nhật");
//        variables.put("message", "Chúc mừng! Hồ sơ của bạn đã được bệnh viện tiếp nhận. Bạn chính thức là bác sĩ của hệ thống.");
//        variables.put("url", frontendUrl + "/doctor/dashboard");
//        variables.put("btnText", "Vào Dashboard ngay");
//
//        pushToQueue(user.getEmail(), "Chúc mừng! Bạn đã trở thành bác sĩ", "doctor-approval-template", variables);
//    }


    // NGHIỆP VỤ TỪ CHỐI BÁC SĨ
    public void sendDoctorRejectionEmail(User user, String reason) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());
        variables.put("message", "Hồ sơ bác sĩ của bạn đã bị từ chối với lý do: " + reason);
        variables.put("url", "https://healthcareconnect.com/support");
        variables.put("btnText", "Liên hệ hỗ trợ");

        pushToQueue(user.getEmail(), "Thông báo kết quả hồ sơ Bác sĩ", "doctor-rejection-template", variables);
    }

    // NGHIỆP VỤ XÁC THỰC HỒ SƠ (Dùng chung cho Doctor và Receptionist)
    public void sendProfileVerifiedEmail(User user, String code, String hospitalName, String role, String urlPath) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());
        variables.put("code", code);
        variables.put("hospitalName", hospitalName != null ? hospitalName : "Đang cập nhật");
        variables.put("role", role); // "bác sĩ" hoặc "lễ tân"
        variables.put("message", "Hồ sơ của bạn đã được Admin xác thực thành công. Vui lòng chờ " +
                (role.equals("bác sĩ") ? "bệnh viện" : "bệnh viện") + " tiếp nhận.");
        variables.put("url", frontendUrl + urlPath);
        variables.put("btnText", "Xem hồ sơ");

        pushToQueue(user.getEmail(), "Hồ sơ " + role + " đã được xác thực", "profile-verified-template", variables);
    }

    // NGHIỆP VỤ DUYỆT HỒ SƠ (Dùng chung cho Doctor và Receptionist)
    public void sendProfileApprovalEmail(User user, String code, String hospitalName, String role, String urlPath) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());
        variables.put("code", code);
        variables.put("hospitalName", hospitalName);
        variables.put("role", role);
        variables.put("message", "Chúc mừng! Hồ sơ của bạn đã được " +
                (role.equals("bác sĩ") ? "bệnh viện tiếp nhận" : "bệnh viện tiếp nhận") +
                ". Bạn chính thức là " + role + " của hệ thống.");
        variables.put("url", frontendUrl + urlPath);
        variables.put("btnText", "Vào Dashboard ngay");

        pushToQueue(user.getEmail(), "Chúc mừng! Bạn đã trở thành " + role, "profile-approval-template", variables);
    }

    // NGHIỆP VỤ TỪ CHỐI HỒ SƠ (Dùng chung cho Doctor và Receptionist)
    public void sendProfileRejectionEmail(User user, String reason, String role) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());
        variables.put("role", role);
        variables.put("message", "Hồ sơ đăng ký làm " + role + " của bạn đã bị từ chối với lý do: " + reason);
        variables.put("url", frontendUrl + "/support");
        variables.put("btnText", "Liên hệ hỗ trợ");

        pushToQueue(user.getEmail(), "Thông báo kết quả hồ sơ " + role, "profile-rejection-template", variables);
    }

    // NGHIỆP VỤ ĐẶT LỊCH
    public void sendBookingEmail(User patient, Schedule schedule) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", patient.getFullName());

        // Format
        String formattedDate = schedule.getStartTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String formattedTime = schedule.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm"));
        String formattedEndTime = schedule.getEndTime().format(DateTimeFormatter.ofPattern("HH:mm"));
        String formattedPrice = String.format("%,.0f", schedule.getPrice());

        variables.put("appointmentDate", formattedDate);
        variables.put("appointmentTime", formattedTime);
        variables.put("appointmentEndTime", formattedEndTime);
        variables.put("doctorName", schedule.getDoctor().getUser().getFullName());
        variables.put("hospitalName", schedule.getDoctor().getHospital().getName());
        variables.put("specialtyName", schedule.getDoctor().getSpecialty().getName());
        variables.put("price", formattedPrice);
        variables.put("address", schedule.getDoctor().getHospital().getAddress());

        variables.put("url", frontendUrl + "/my-appointments");
        variables.put("btnText", "Xem lịch khám của tôi");

        pushToQueue(patient.getEmail(), "Xác nhận đặt lịch khám thành công", "booking-confirmation-template", variables);
    }

    // NGHIỆP VỤ LỜI MỜI
    public void sendManagerInvitation(User user, Hospital hospital, String token) {
        String confirmationUrl = frontendUrl + "/confirm-invitation?token=" + token
                + "&hospitalId=" + hospital.getId();

        Map<String, Object> variables = new HashMap<>();
        variables.put("managerName", user.getFullName());
        variables.put("hospitalName", hospital.getName());
        variables.put("hospitalAddress", hospital.getAddress());
        variables.put("confirmationUrl", confirmationUrl);
        variables.put("expiryHours", 24);

        pushToQueue(
                user.getEmail(),
                "[Healthcare Connect] Lời mời quản lý Bệnh viện " + hospital.getName(),
                "manager-invitation-template",
                variables
        );
    }

    // NGHIỆP VỤ XÁC NHẬN THANH TOÁN
//    public void sendPaymentSuccessEmail(Appointment appointment) {
//        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
//        String formattedStartTime = appointment.getSchedule().getStartTime().format(formatter);
//        String qrCodeImage = qrCodeService.generateQRCodeBase64(appointment.getId().toString());
//        log.info("QR Code Image length: {}", qrCodeImage != null ? qrCodeImage.length() : "null");
//        log.info("QR Code Image starts with: {}", qrCodeImage != null ? qrCodeImage.substring(0, 50) : "null");
//
//        Map<String, Object> variables = new HashMap<>();
//        variables.put("patientName", appointment.getPatient().getFullName());
//        variables.put("appointmentId", appointment.getId().toString().substring(0, 8));
//        variables.put("doctorName", appointment.getSchedule().getDoctor().getUser().getFullName());
//        variables.put("startTime", formattedStartTime);
//        variables.put("amount", appointment.getSchedule().getPrice());
//        variables.put("qrCodeImage", qrCodeImage);
//
//        pushToQueue(
//                appointment.getPatient().getEmail(),
//                "Xác nhận thanh toán thành công - Healthcare Connect",
//                "payment-success-template",
//                variables
//        );
//    }

    // NGHIỆP VỤ XÁC NHẬN THANH TOÁN DÙNG CID ĐỂ GỬI QR
    public void sendPaymentSuccessEmail(Appointment appointment) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String formattedStartTime = appointment.getSchedule().getStartTime().format(formatter);

        Map<String, Object> variables = new HashMap<>();
        variables.put("patientName", appointment.getPatient().getFullName());
        variables.put("appointmentId", appointment.getId().toString().substring(0, 8));
        variables.put("doctorName", appointment.getSchedule().getDoctor().getUser().getFullName());
        variables.put("startTime", formattedStartTime);
        variables.put("amount", appointment.getSchedule().getPrice());

        NotificationMessage message = NotificationMessage.builder()
                .recipientEmail(appointment.getPatient().getEmail())
                .subject("Xác nhận thanh toán thành công - Healthcare Connect")
                .templateName("payment-success-template")
                .variables(variables)
                .appointmentId(appointment.getId())
                .paymentType("PAYMENT_SUCCESS")
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, message);
    }

    // --- HÀM GỬI MAIL VẬT LÝ ---
    public void sendEmailPhysical(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            Context context = new Context();
            context.setVariables(variables);
            String htmlContent = templateEngine.process(templateName, context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom(mailFrom);

            mailSender.send(message);
            log.info("==> [SUCCESS] Email gửi tới {} thành công!", to);
        } catch (Exception e) {
            log.error("==> [ERROR] Lỗi gửi mail vật lý: {}", e.getMessage());
            throw new RuntimeException("Gửi mail thất bại", e);
        }
    }

    @PostConstruct
    public void checkConfig() {
        log.info("==> [CONFIG] Mail Service khởi tạo thành công với email: {}", mailFrom);
    }
}
