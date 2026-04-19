package com.hoanglong.healthcare_connect_backend.core.entity;

import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistApplicationStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "receptionist_application_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReceptionistApplicationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "receptionist_id", nullable = false)
    UUID receptionistId;

    @Column(name = "actor_id")
    UUID actorId;

    @Column(name = "actor_role", length = 50)
    String actorRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 50)
    ReceptionistApplicationStatus action;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 50)
    ReceptionistStatus  oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 50)
    ReceptionistStatus newStatus;

    @Column(name = "rejection_reason", length = 255)
    String rejectionReason;

    @Column(name = "rejection_note", columnDefinition = "TEXT")
    String rejectionNote;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    String changes;

    @Column(columnDefinition = "TEXT")
    String note;

    @Column(name = "ip_address", length = 50)
    String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    String userAgent;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}