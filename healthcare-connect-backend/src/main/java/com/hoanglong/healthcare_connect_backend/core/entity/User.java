package com.hoanglong.healthcare_connect_backend.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private String phone;

    private LocalDateTime createdAt;

    private String verificationCode;

    private LocalDateTime verificationExpiry;

    @Column(name = "is_enabled")
    private Boolean enabled = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}