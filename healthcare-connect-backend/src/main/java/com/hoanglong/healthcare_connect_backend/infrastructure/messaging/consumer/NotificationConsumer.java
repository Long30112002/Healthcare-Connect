package com.hoanglong.healthcare_connect_backend.infrastructure.messaging.consumer;

import com.hoanglong.healthcare_connect_backend.application.dto.NotificationMessage;
import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.infrastructure.messaging.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer
{

    private final MailService mailService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void listen(NotificationMessage message) {
        log.info("Nhận thông điệp từ Queue cho email: {}", message.getRecipientEmail());
            mailService.sendEmailPhysical(
                    message.getRecipientEmail(),
                    message.getSubject(),
                    message.getTemplateName(),
                    message.getVariables()
            );
        log.info("Đã xử lý gửi   mail thành công đến: {}", message.getRecipientEmail());
    }
}