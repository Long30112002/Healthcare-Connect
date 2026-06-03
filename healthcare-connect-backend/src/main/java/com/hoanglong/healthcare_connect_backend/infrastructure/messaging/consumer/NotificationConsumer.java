package com.hoanglong.healthcare_connect_backend.infrastructure.messaging.consumer;

import com.hoanglong.healthcare_connect_backend.application.dto.notification.NotificationMessage;
import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.application.service.QRCodeService;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.infrastructure.messaging.config.RabbitMQConfig;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private static final String PAYMENT_SUCCESS = "PAYMENT_SUCCESS";

    private final MailService mailService;
    private final QRCodeService qrCodeService;
    private final AppointmentRepository appointmentRepository;
//    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

//    @Value("${spring.mail.username}")
//    private String mailFrom;

    @Value("${BREVO_API_KEY:}")
    private String brevoApiKey;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void listen(NotificationMessage message) {
        log.info("Nhận message gửi đến: {}", message.getRecipientEmail());

        try {
            if (isPaymentSuccessWithQR(message)) {
                handlePaymentSuccess(message);
            } else {
                handleNormalEmail(message);
            }
        } catch (Exception e) {
            log.error("Lỗi xử lý message email", e);
        }
    }

    // ================= NORMAL EMAIL =================
    private void handleNormalEmail(NotificationMessage message) {
        mailService.sendEmailPhysical(
                message.getRecipientEmail(),
                message.getSubject(),
                message.getTemplateName(),
                message.getVariables()
        );
    }

    // ================= PAYMENT SUCCESS =================
    private void handlePaymentSuccess(NotificationMessage message) {
//        handleNormalEmail(message);
        UUID appointmentId = message.getAppointmentId();

        Optional<Appointment> optional = appointmentRepository.findByIdWithDetails(appointmentId);

        if (optional.isEmpty()) {
            log.error("Không tìm thấy appointment: {}", appointmentId);
            return;
        }

        Appointment appointment = optional.get();

        try {
            sendPaymentEmailWithQR(message, appointment);
        } catch (Exception e) {
            log.error("Lỗi gửi email PAYMENT_SUCCESS", e);
        }
    }

//    private void sendPaymentEmailWithQR(NotificationMessage message, Appointment appointment) throws Exception {
//
//        byte[] qrBytes = qrCodeService.generateQRCodeImage(appointment.getId().toString());
//        String qrCid = "qr-" + appointment.getId();
//
//        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
//        String formattedStartTime = appointment.getSchedule().getStartTime().format(formatter);
//
//        Map<String, Object> variables = new HashMap<>(message.getVariables());
//        variables.put("qrCid", qrCid);
//        variables.put("startTime", formattedStartTime);
//        variables.put("doctorName", appointment.getSchedule().getDoctor().getUser().getFullName());
//
//        Context context = new Context();
//        context.setVariables(variables);
//        String htmlContent = templateEngine.process(message.getTemplateName(), context);
//
//        MimeMessage mimeMessage = mailSender.createMimeMessage();
//        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
//
//        helper.setTo(message.getRecipientEmail());
//        helper.setSubject(message.getSubject());
//        helper.setText(htmlContent, true);
//        helper.setFrom(mailFrom);
//
//        helper.addInline(qrCid, new org.springframework.core.io.ByteArrayResource(qrBytes), "image/png");
//
//        mailSender.send(mimeMessage);
//        log.info("SEND MESSAGE: {}", message);
//        log.info("✅ Đã gửi email PAYMENT_SUCCESS đến: {}", message.getRecipientEmail());
//    }

    private void sendPaymentEmailWithQR(NotificationMessage message, Appointment appointment) throws Exception {
        byte[] qrBytes = qrCodeService.generateQRCodeImage(appointment.getId().toString());
        String qrCid = "qr-" + appointment.getId();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String formattedStartTime = appointment.getSchedule().getStartTime().format(formatter);

        Map<String, Object> variables = new HashMap<>(message.getVariables());
        variables.put("qrCid", qrCid);
        variables.put("startTime", formattedStartTime);
        variables.put("doctorName", appointment.getSchedule().getDoctor().getUser().getFullName());

        Context context = new Context();
        context.setVariables(variables);
        String htmlContent = templateEngine.process(message.getTemplateName(), context);

        // Chuyển QR code thành base64 để nhúng vào HTML
        String qrBase64 = "data:image/png;base64," + java.util.Base64.getEncoder().encodeToString(qrBytes);
        String htmlWithQR = htmlContent.replace("cid:" + qrCid, qrBase64);

        // Gửi qua Brevo API
        String jsonBody = String.format(
                "{\"sender\":{\"email\":\"noreply@brevo.com\",\"name\":\"Healthcare Connect\"}," +
                        "\"to\":[{\"email\":\"%s\"}]," +
                        "\"subject\":\"%s\"," +
                        "\"htmlContent\":\"%s\"}",
                message.getRecipientEmail(),
                escapeJson(message.getSubject()),
                escapeJson(htmlWithQR)
        );

        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url("https://api.brevo.com/v3/smtp/email")
                .post(RequestBody.create(jsonBody, MediaType.parse("application/json")))
                .addHeader("accept", "application/json")
                .addHeader("api-key", brevoApiKey)
                .addHeader("content-type", "application/json")
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.isSuccessful()) {
                log.info("✅ Đã gửi email PAYMENT_SUCCESS (có QR) đến: {}", message.getRecipientEmail());
            } else {
                log.error("Brevo API lỗi: {}", response.code());
            }
        }
    }

    private String escapeJson(String s) {
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }

    // ================= HELPER =================
    private boolean isPaymentSuccessWithQR(NotificationMessage message) {
        return PAYMENT_SUCCESS.equals(message.getPaymentType())
                && message.getAppointmentId() != null;
    }
}