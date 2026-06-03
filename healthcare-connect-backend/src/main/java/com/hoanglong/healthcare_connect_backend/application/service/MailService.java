package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.notification.NotificationMessage;
import com.hoanglong.healthcare_connect_backend.core.constant.UserRole;
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
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.math.BigDecimal;
import java.net.InetAddress;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {
    private final JavaMailSender mailSender;
    private final RabbitTemplate rabbitTemplate;
    private final SpringTemplateEngine templateEngine;


    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.frontend.public-url:${app.frontend.url}}")
    private String publicFrontendUrl;

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
        String verifyUrl = publicFrontendUrl + "/verify?code=" + user.getVerificationCode();
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
        String resetUrl = publicFrontendUrl + "/reset-password?code=" + user.getVerificationCode();
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());
        variables.put("url", resetUrl);
        variables.put("message", "Chúng tôi nhận được yêu cầu đặt lại mật khẩu của bạn. Link này có hiệu lực trong 30 phút.");
        variables.put("btnText", "Đặt lại mật khẩu");

        this.pushToQueue(user.getEmail(), "Yêu cầu đặt lại mật khẩu", "email-template", variables);
    }

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
        variables.put("url", publicFrontendUrl + urlPath);
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
        variables.put("url", publicFrontendUrl + urlPath);
        variables.put("btnText", "Vào Dashboard ngay");

        pushToQueue(user.getEmail(), "Chúc mừng! Bạn đã trở thành " + role, "profile-approval-template", variables);
    }

    // NGHIỆP VỤ TỪ CHỐI HỒ SƠ (Dùng chung cho Doctor và Receptionist)
    public void sendProfileRejectionEmail(User user, String reason, String role) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());
        variables.put("role", role);
        variables.put("message", "Hồ sơ đăng ký làm " + role + " của bạn đã bị từ chối với lý do: " + reason);
        variables.put("url", publicFrontendUrl + "/support");
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

        variables.put("url", publicFrontendUrl + "/my-appointments");
        variables.put("btnText", "Xem lịch khám của tôi");

        pushToQueue(patient.getEmail(), "Xác nhận đặt lịch khám thành công", "booking-confirmation-template", variables);
    }

    // NGHIỆP VỤ LỜI MỜI
    public void sendManagerInvitation(User user, Hospital hospital, String token) {
        String confirmationUrl = publicFrontendUrl + "/confirm-invitation?token=" + token
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

    // NGHIỆP VỤ THÔNG BÁO BỆNH ÁN MỚI ĐƯỢC TẠO
    public void sendMedicalRecordCreatedEmail(MedicalRecord medicalRecord) {
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("patientName", medicalRecord.getPatient().getFullName());
            variables.put("doctorName", medicalRecord.getDoctor().getUser().getFullName());
            variables.put("hospitalName", medicalRecord.getHospital().getName());
            variables.put("diagnosis", medicalRecord.getDiagnosis());
            variables.put("followUpDate", formatDate(medicalRecord.getFollowUpDate()));
            variables.put("prescriptionCount", medicalRecord.getPrescriptions() != null ?
                    medicalRecord.getPrescriptions().size() : 0);

            // Tính tổng tiền thuốc
            BigDecimal totalMedicinePrice = BigDecimal.ZERO;
            List<Map<String, Object>> medicineList = new ArrayList<>();

            if (medicalRecord.getPrescriptions() != null) {
                for (var prescription : medicalRecord.getPrescriptions()) {
                    if (prescription.getItems() != null) {
                        for (PrescriptionItem item : prescription.getItems()) {
                            totalMedicinePrice = totalMedicinePrice.add(item.getTotalPrice());

                            Map<String, Object> medicineInfo = new HashMap<>();
                            medicineInfo.put("name", item.getMedicine().getName());
                            medicineInfo.put("dosage", item.getDosage());
                            medicineInfo.put("frequency", item.getFrequency());
                            medicineInfo.put("quantity", item.getQuantity());
                            medicineList.add(medicineInfo);
                        }
                    }
                }
            }

            variables.put("totalMedicinePrice", String.format("%,.0f", totalMedicinePrice));
            variables.put("medicines", medicineList);
            variables.put("url", "http://localhost:3000/my-medical-records/" + medicalRecord.getId());
            variables.put("btnText", "Xem bệnh án chi tiết");

            NotificationMessage message = NotificationMessage.builder()
                    .recipientEmail(medicalRecord.getPatient().getEmail())
                    .subject("Bệnh án mới được tạo - Healthcare Connect")
                    .templateName("medical-record-template")
                    .variables(variables)
                    .appointmentId(medicalRecord.getAppointment().getId())
                    .paymentType("MEDICAL_RECORD")
                    .build();

            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.ROUTING_KEY,
                    message);

            log.info("Đã gửi thông báo bệnh án đến email: {}", medicalRecord.getPatient().getEmail());
        } catch (Exception e) {
            log.error("Lỗi gửi thông báo bệnh án: {}", e.getMessage());
        }
    }

    // NGHIỆP VỤ NHẮC LỊCH TÁI KHÁM
    public void sendFollowUpReminderEmail(MedicalRecord medicalRecord) {
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("patientName", medicalRecord.getPatient().getFullName());
            variables.put("doctorName", medicalRecord.getDoctor().getUser().getFullName());
            variables.put("hospitalName", medicalRecord.getHospital().getName());
            variables.put("hospitalAddress", medicalRecord.getHospital().getAddress());
            variables.put("followUpDate", formatDate(medicalRecord.getFollowUpDate()));
            variables.put("diagnosis", medicalRecord.getDiagnosis());
            variables.put("url", "http://localhost:3000/appointments/book?doctorId=" + medicalRecord.getDoctor().getId());
            variables.put("btnText", "Đặt lịch tái khám");

            NotificationMessage message = NotificationMessage.builder()
                    .recipientEmail(medicalRecord.getPatient().getEmail())
                    .subject("Nhắc lịch tái khám - Healthcare Connect")
                    .templateName("followup-reminder-template")
                    .variables(variables)
                    .appointmentId(medicalRecord.getAppointment().getId())
                    .paymentType("FOLLOW_UP_REMINDER")
                    .build();

            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.ROUTING_KEY,
                    message);

            log.info("Đã gửi nhắc lịch tái khám đến email: {}", medicalRecord.getPatient().getEmail());
        } catch (Exception e) {
            log.error("Lỗi gửi nhắc lịch tái khám: {}", e.getMessage());
        }
    }


    // Hàm gửi email thông báo khóa tài khoản
    public void sendAccountLockedEmail(User user, String reason, User lockedByAdmin) {
        String loginUrl = publicFrontendUrl + "/login";

        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());
        variables.put("reason", reason != null ? reason : "Không có lý do cụ thể");
        variables.put("lockedBy", lockedByAdmin != null ? lockedByAdmin.getFullName() : "Quản trị viên");
        variables.put("lockedAt", formatDateTime(LocalDateTime.now()));
        variables.put("loginUrl", loginUrl);
        variables.put("supportEmail", "support@healthcareconnect.vn");
        variables.put("supportPhone", "1900 1234");
        variables.put("btnText", "Liên hệ hỗ trợ");

        pushToQueue(
                user.getEmail(),
                "[Healthcare Connect] Thông báo khóa tài khoản",
                "account-locked-template",
                variables
        );
    }

    // Hàm gửi email thông báo mở khóa tài khoản
    public void sendAccountUnlockedEmail(User user, User unlockedByAdmin) {
        String loginUrl = publicFrontendUrl + "/login";

        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());
        variables.put("unlockedBy", unlockedByAdmin != null ? unlockedByAdmin.getFullName() : "Quản trị viên");
        variables.put("unlockedAt", formatDateTime(LocalDateTime.now()));
        variables.put("loginUrl", loginUrl);
        variables.put("btnText", "Đăng nhập ngay");

        pushToQueue(
                user.getEmail(),
                "[Healthcare Connect] Thông báo mở khóa tài khoản",
                "account-unlocked-template",
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
        try {
            InetAddress address = InetAddress.getByName("smtp.gmail.com");
            log.info("==> [DNS] smtp.gmail.com = {}", address.getHostAddress());
        } catch (Exception e) {
            log.error("==> [DNS ERROR] {}", e.getMessage(), e);
        }
    }

    private String formatDate(LocalDate date) {
        if (date == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return date.format(formatter);
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        return dateTime.format(formatter);
    }
}
