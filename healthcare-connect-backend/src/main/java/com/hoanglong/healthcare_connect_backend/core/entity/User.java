package com.hoanglong.healthcare_connect_backend.core.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false)
    String fullName;

    @Column(unique = true, nullable = false)
    String email;

    @Column(nullable = false)
    String password;

    @Enumerated(EnumType.STRING)
    UserRole role;

    String phone;

    LocalDateTime createdAt;

    String verificationCode;

    LocalDateTime verificationExpiry;

    @Column(name = "is_enabled")
    Boolean enabled = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}