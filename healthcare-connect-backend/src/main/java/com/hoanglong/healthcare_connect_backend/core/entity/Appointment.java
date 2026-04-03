package com.hoanglong.healthcare_connect_backend.core.entity;

import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    private LocalDateTime appointmentDate;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "is_rescheduled")
    private boolean isRescheduled = false;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "is_paid")
    private boolean isPaid = false;
}