package com.hoanglong.healthcare_connect_backend.core.entity;

import com.hoanglong.healthcare_connect_backend.core.constant.HospitalStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "hospitals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Hospital {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false)
    String name;

    String address;

    @Column(columnDefinition = "TEXT")
    String description;

    String imageUrl;

    @Column(length = 20)
    String hotline;

    String email;

    String website;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    HospitalStatus status = HospitalStatus.PENDING_CONFIRMATION; // Mặc định là chờ

    String invitationToken;

    LocalDateTime tokenExpiry;

    @Column(name = "temp_manager_email")
    String tempManagerEmail;

    @OneToOne
    @JoinColumn(name = "manager_id", nullable = true)
    User manager;

    @CreationTimestamp
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}