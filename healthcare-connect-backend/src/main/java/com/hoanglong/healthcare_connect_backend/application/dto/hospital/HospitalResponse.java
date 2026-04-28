package com.hoanglong.healthcare_connect_backend.application.dto.hospital;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HospitalResponse {
    UUID id;
    String name;
    String address;
    String description;
    String imageUrl;
    String managerEmail;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    String hotline;
    String email;
    String website;
}