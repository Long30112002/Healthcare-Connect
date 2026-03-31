package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
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

    @Async
    public void sendEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            Context context = new Context();
            context.setVariables(variables);

            String htmlContent = templateEngine.process(templateName, context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom("no-reply@healthcareconnect.com");

            mailSender.send(message);
            log.info("Email gửi tới {} thành công!", to);
        } catch (MessagingException e) {
            log.error("Lỗi gửi mail: {}", e.getMessage());
        }
    }

    public void sendVerificationEmail(User user) {
        try {
            String verificationCode = user.getVerificationCode();
            if (verificationCode == null) {
                log.error("Không tìm thấy mã xác thực cho user: {}", user.getEmail());
                return;
            }

            String verifyUrl = "http://localhost:8080/api/auth/verify?code=" + verificationCode;
            Map<String, Object> variables = new HashMap<>();
            variables.put("name", user.getFullName());
            variables.put("url", verifyUrl);

            String subject;
            String message;
            String buttonText;

            // Tùy biến nội dung dựa trên ROLE
            if (user.getRole() == UserRole.HOSPITAL_MANAGER) {
                subject = "Xác thực quyền Quản lý Bệnh viện - Healthcare Connect";
                message = "Bạn đã được chỉ định làm Quản lý Bệnh viện trên hệ thống Healthcare Connect. Vui lòng nhấn nút bên dưới để xác thực tài khoản và bắt đầu thiết lập thông tin bệnh viện.";
                buttonText = "Kích hoạt quyền Quản lý";
            } else {
                subject = "Xác thực tài khoản Healthcare Connect";
                message = "Cảm ơn bạn đã đăng ký thành viên. Vui lòng bấm vào nút bên dưới để kích hoạt tài khoản của bạn. Link có hiệu lực trong 24 giờ.";
                buttonText = "Xác thực tài khoản";
            }

            variables.put("message", message);
            variables.put("btnText", buttonText);

            this.sendEmail(user.getEmail(), subject, "email-template", variables);

            log.info("Đã gửi mail xác thực ({}) tới: {}", user.getRole(), user.getEmail());
        } catch (Exception e) {
            log.error("Lỗi gửi mail xác thực: {}", e.getMessage());
        }
    }

    public void sendSecurityEmail(User user, String type) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());

        String actionUrl = "http://localhost:3000/reset-password?code=" + user.getVerificationCode();
        variables.put("url", actionUrl);

        String subject;
        String message;
        String btnText;

        if ("FORGOT_PASSWORD".equals(type)) {
            subject = "Yêu cầu đặt lại mật khẩu - Healthcare Connect";
            message = "Chúng tôi nhận được yêu cầu đặt lại mật khẩu của bạn. Vui lòng nhấn nút dưới đây:";
            btnText = "Đặt lại mật khẩu";
        } else if ("SETUP_MANAGER".equals(type)) {
            subject = "Lời mời Quản lý Bệnh viện - Healthcare Connect";
            message = "Bạn đã được bổ nhiệm làm Quản lý. Vui lòng thiết lập mật khẩu để bắt đầu sử dụng hệ thống.";
            btnText = "Thiết lập tài khoản";
        } else if ("UPGRADE_TO_MANAGER".equals(type)) {
            subject = "Thông báo nâng cấp quyền hạn - Healthcare Connect";
            message = "Tài khoản của bạn đã được Admin nâng cấp lên quyền Quản lý Bệnh viện. Bạn có thể đăng nhập bằng mật khẩu cũ để quản lý bệnh viện ngay bây giờ.";
            btnText = "Đi đến Dashboard";
            variables.put("url", "http://localhost:3000/login");
        } else {
            subject = "Xác thực tài khoản";
            message = "Vui lòng xác thực tài khoản.";
            btnText = "Xác thực";
        }

        variables.put("message", message);
        variables.put("btnText", btnText);
        this.sendEmail(user.getEmail(), subject, "email-template", variables);
    }

    public void sendWelcomeEmail(User user) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());

        // Tùy biến lời chào theo Role
        String message = user.getRole() == UserRole.DOCTOR
                ? "Chào mừng Bác sĩ gia nhập hệ thống. Vui lòng kiểm tra lịch trình làm việc tại trang quản trị."
                : "Chào mừng bạn đến với Healthcare Connect. Bạn có thể bắt đầu đặt lịch khám ngay bây giờ.";

        variables.put("message", message);
        variables.put("url", "https://healthcare-connect.com/login"); // Link trang web của bạn

        this.sendEmail(
                user.getEmail(),
                "Chào mừng bạn đến với Healthcare Connect",
                "email-template", // Tên file HTML trong folder templates
                variables
        );
    }
}