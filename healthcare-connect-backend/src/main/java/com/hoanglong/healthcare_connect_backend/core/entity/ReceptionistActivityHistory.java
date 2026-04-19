package com.hoanglong.healthcare_connect_backend.core.entity;

import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistActivityAction;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "receptionist_activity_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReceptionistActivityHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "receptionist_id", nullable = false)
    UUID receptionistId;

    @Column(name = "hospital_id", nullable = false)
    UUID hospitalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 50)
    ReceptionistActivityAction action;

    @Column(name = "appointment_id")
    UUID appointmentId;

    @Column(name = "payment_id")
    UUID paymentId;

    @Column(name = "target_user_id")
    UUID targetUserId;

    @Column(name = "target_patient_name")
    String targetPatientName;

    @Column(name = "target_patient_phone", length = 20)
    String targetPatientPhone;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    String changes;

    @Column(name = "ip_address", length = 50)
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
