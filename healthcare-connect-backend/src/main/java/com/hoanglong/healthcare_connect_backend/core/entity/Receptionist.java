package com.hoanglong.healthcare_connect_backend.core.entity;

import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "receptionists")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Receptionist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    User user;

    @ManyToOne
    @JoinColumn(name = "hospital_id", nullable = false)
    Hospital hospital;

    @Column(name = "receptionist_code", unique = true, nullable = false)
    String receptionistCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    ReceptionistStatus status = ReceptionistStatus.PENDING;

    @Column(name = "cv_url")
    String cvUrl;

    @Column(name = "rejection_reason")
    String rejectionReason;

    @Column(name = "rejection_note", columnDefinition = "TEXT")
    String rejectionNote;

    @CreationTimestamp
    @Column(name = "created_at")
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}