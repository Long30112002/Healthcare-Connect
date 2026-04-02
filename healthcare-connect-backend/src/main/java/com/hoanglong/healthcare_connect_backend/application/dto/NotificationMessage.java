package com.hoanglong.healthcare_connect_backend.application.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Map;

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
}