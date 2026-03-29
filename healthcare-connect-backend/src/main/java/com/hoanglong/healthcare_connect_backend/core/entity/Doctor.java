package com.hoanglong.healthcare_connect_backend.core.entity;

import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.RejectionReason;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@Table(name = "doctors")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(unique = true, nullable = false)
    String doctorCode;

    @OneToOne
    @JoinColumn(name = "user_id")
    User user;

    @ManyToOne
    @JoinColumn(name = "specialty_id")
    Specialty specialty;

    @ManyToOne
    @JoinColumn(name = "department_id")
    Department department;

    String degree;

    @Column(name = "experience_years")
    Integer experienceYears;

    @Column(columnDefinition = "TEXT")
    String biography;

    @Column(name = "cv_url")
    String cvUrl;

    BigDecimal consultationFee;

    @Enumerated(EnumType.STRING)
    DoctorStatus status;

    @Enumerated(EnumType.STRING)
    RejectionReason rejectionReason;

    String rejectionNote;

    // Bổ sung thêm để quản lý thời gian
    @CreationTimestamp
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}