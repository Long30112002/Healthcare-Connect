package com.hoanglong.healthcare_connect_backend.application.dto.notification;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Map;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationMessage implements Serializable {
    String recipientEmail;
    String subject;
    String templateName; // "email-template" hoặc template riêng cho từng loại
    // Dùng Map để chứa bất kỳ thứ gì: name, url, message, time...
    Map<String, Object> variables;
    UUID appointmentId;
    String paymentType;
}