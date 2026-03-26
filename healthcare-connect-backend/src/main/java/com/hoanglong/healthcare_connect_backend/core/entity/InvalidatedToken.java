package com.hoanglong.healthcare_connect_backend.core.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvalidatedToken {
    @Id
    String id; // Chính là JTI (JWT ID) của Token

    Date expiryTime; // Thời điểm Token này hết hạn hoàn toàn
}