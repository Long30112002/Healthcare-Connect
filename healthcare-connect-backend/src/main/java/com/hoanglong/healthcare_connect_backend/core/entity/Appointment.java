package com.hoanglong.healthcare_connect_backend.core.entity;

import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.BookingType;
import com.hoanglong.healthcare_connect_backend.core.constant.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = true)
    User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    Schedule schedule;

    LocalDateTime appointmentDate;

    @Enumerated(EnumType.STRING)
    AppointmentStatus status;

    @Column(columnDefinition = "TEXT")
    String symptoms;

    @Column(name = "is_rescheduled")
    boolean isRescheduled = false;

    @Column(name = "cancel_reason")
    String cancelReason;

    @Column(name = "check_in_time")
    LocalDateTime checkInTime;

    @Column(name = "is_paid")
    boolean isPaid = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    Room room;

    @Column(name = "patient_name")
    String patientName;

    @Column(name = "patient_phone")
    String patientPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_type")
    BookingType bookingType;
}