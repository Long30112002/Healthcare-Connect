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
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final RabbitTemplate rabbitTemplate;

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

    // 1. NGHIỆP VỤ XÁC THỰC
    public void sendVerificationEmail(User user) {
        String verifyUrl = "http://localhost:8080/api/auth/verify?code=" + user.getVerificationCode();
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

    // 2. NGHIỆP VỤ BẢO MẬT
    public void sendSecurityEmail(User user, String type) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());
        String actionUrl = "http://localhost:3000/reset-password?code=" + user.getVerificationCode();
        variables.put("url", actionUrl);

        String subject, message, btnText;
        if ("FORGOT_PASSWORD".equals(type)) {
            subject = "Yêu cầu đặt lại mật khẩu - Healthcare Connect";
            message = "Chúng tôi nhận được yêu cầu đặt lại mật khẩu của bạn.";
            btnText = "Đặt lại mật khẩu";
        } else if ("SETUP_MANAGER".equals(type)) {
            subject = "Lời mời Quản lý Bệnh viện - Healthcare Connect";
            message = "Bạn đã được bổ nhiệm làm Quản lý. Vui lòng thiết lập mật khẩu để bắt đầu.";
            btnText = "Thiết lập tài khoản";
        } else if ("UPGRADE_TO_MANAGER".equals(type)) {
            subject = "Thông báo nâng cấp quyền hạn - Healthcare Connect";
            message = "Tài khoản của bạn đã được Admin nâng cấp lên quyền Quản lý Bệnh viện.";
            btnText = "Đi đến Dashboard";
            variables.put("url", "http://localhost:3000/login");
        } else {
            subject = "Xác nhận hoạt động tài khoản";
            message = "Vui lòng hoàn tất xác thực tài khoản.";
            btnText = "Xác thực";
        }

        variables.put("message", message);
        variables.put("btnText", btnText);
        pushToQueue(user.getEmail(), subject, "email-template", variables);
    }

    // 3. NGHIỆP VỤ QUÊN MẬT KHẨU
    public void sendForgotPasswordEmail(User user) {
        String resetUrl = "http://localhost:3000/reset-password?code=" + user.getVerificationCode();
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());
        variables.put("url", resetUrl);
        variables.put("message", "Chúng tôi nhận được yêu cầu đặt lại mật khẩu của bạn. Link này có hiệu lực trong 30 phút.");
        variables.put("btnText", "Đặt lại mật khẩu");

        this.pushToQueue(user.getEmail(), "Yêu cầu đặt lại mật khẩu", "email-template", variables);
    }

    // 4. NGHIỆP VỤ DUYỆT BÁC SĨ
    public void sendDoctorApprovalEmail(User user) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());
        variables.put("message", "Chúc mừng! Bạn đã chính thức trở thành Bác sĩ trên hệ thống.");
        variables.put("url", "https://healthcareconnect.com/doctor/dashboard");
        variables.put("btnText", "Vào Dashboard ngay");

        pushToQueue(user.getEmail(), "Chúc mừng Bác sĩ đã được duyệt!", "email-template", variables);
    }

    // 5. NGHIỆP VỤ TỪ CHỐI BÁC SĨ
    public void sendDoctorRejectionEmail(User user, String reason) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());
        variables.put("message", "Hồ sơ bác sĩ của bạn đã bị từ chối với lý do: " + reason);
        variables.put("url", "https://healthcareconnect.com/support");
        variables.put("btnText", "Liên hệ hỗ trợ");

        pushToQueue(user.getEmail(), "Thông báo kết quả hồ sơ Bác sĩ", "email-template", variables);
    }

    // 6. NGHIỆP VỤ ĐẶT LỊCH
    public void sendBookingEmail(User patient, Schedule schedule) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", patient.getFullName());
        variables.put("message", "Lịch khám của bạn vào lúc " + schedule.getStartTime() + " đã được xác nhận thành công.");
        variables.put("url", "http://localhost:3000/my-appointments");
        variables.put("btnText", "Xem lịch khám");

        pushToQueue(patient.getEmail(), "Xác nhận đặt lịch khám thành công", "email-template", variables);
    }

    // 7. NGHIỆP VỤ LỜI MỜI
    public void sendManagerInvitation(User user, Hospital hospital, String token) {
        String confirmationUrl = "http://localhost:3000/confirm-invitation?token=" + token
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

    // 8. NGHIỆP VỤ XÁC NHẬN THANH TOÁN
    public void sendPaymentSuccessEmail(Appointment appointment) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("patientName", appointment.getPatient().getFullName());
        variables.put("appointmentId", appointment.getId().toString().substring(0, 8));
        variables.put("doctorName", appointment.getSchedule().getDoctor().getUser().getFullName());
        variables.put("startTime", appointment.getSchedule().getStartTime());
        variables.put("amount", appointment.getSchedule().getPrice());

        pushToQueue(
                appointment.getPatient().getEmail(),
                "Xác nhận thanh toán thành công - Healthcare Connect",
                "payment-success-template", // Tên file HTML bạn sẽ tạo
                variables
        );
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