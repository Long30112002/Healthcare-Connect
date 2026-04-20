package com.hoanglong.healthcare_connect_backend.core.entity;

import com.hoanglong.healthcare_connect_backend.core.constant.ScheduleStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "schedules")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    Doctor doctor;

    LocalDateTime date;

    LocalDateTime startTime;

    LocalDateTime endTime;

    int maxPatients;

    int currentBookings;

    @Enumerated(EnumType.STRING)
    ScheduleStatus status;

    @Column(precision = 19, scale = 2)
    BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    Room room;
}