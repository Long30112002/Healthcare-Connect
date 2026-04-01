package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.application.dto.NotificationMessage;
import com.hoanglong.healthcare_connect_backend.infrastructure.messaging.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @GetMapping("/send-email")
    public String testSend() {
        NotificationMessage message = NotificationMessage.builder()
                .recipientEmail("email-long@gmail.com")
                .patientName("Hoàng Long")
                .appointmentTime("20:00 - 02/04/2026")
                .message("Hệ thống RabbitMQ chạy cực tốt!")
                .build();

        // Bắn tin nhắn vào Exchange
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.ROUTING_KEY,
                message
        );

        return "Đã gửi tin nhắn vào hàng chờ! Check log ConfirmCallback .";
    }
}