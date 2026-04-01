package com.hoanglong.healthcare_connect_backend.infrastructure.messaging.consumer;

import com.hoanglong.healthcare_connect_backend.application.dto.NotificationMessage;
import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.infrastructure.messaging.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final MailService mailService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void listen(NotificationMessage message) {
        log.info("==> [RABBITMQ] Nhận được tin nhắn từ hàng chờ: {}", message.getRecipientEmail());

        Map<String, Object> variables = new HashMap<>();
        variables.put("name", message.getPatientName());
        variables.put("message", "Lịch khám của bạn vào lúc " + message.getAppointmentTime() + " đã được xác nhận.");
        variables.put("url", "http://localhost:3000/my-appointments");
        variables.put("btnText", "Xem lịch khám");

        // Để mặc lỗi văng ra ngoài, không dùng try-catch ở đây
        mailService.sendEmail(
                message.getRecipientEmail(),
                "Xác nhận đặt lịch khám thành công",
                "email-template",
                variables
        );
    }
}