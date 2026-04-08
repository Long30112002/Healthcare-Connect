package com.hoanglong.healthcare_connect_backend.core.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "doctor_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "doctor_id", nullable = false)
    UUID doctorId;

    @Column(name = "actor_id", nullable = false)
    UUID actorId;

    @Column(name = "actor_role", nullable = false, length = 50)
    String actorRole;

    @Column(name = "action", nullable = false, length = 50)
    String action;

    @Column(name = "old_status", length = 50)
    String oldStatus;

    @Column(name = "new_status", length = 50)
    String newStatus;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    String changes;

    @Column(name = "rejection_reason", length = 255)
    String rejectionReason;

    @Column(name = "rejection_note", columnDefinition = "TEXT")
    String rejectionNote;

    @Column(name = "ip_address")
    String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    String userAgent;

    @Column(columnDefinition = "TEXT")
    String note;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}