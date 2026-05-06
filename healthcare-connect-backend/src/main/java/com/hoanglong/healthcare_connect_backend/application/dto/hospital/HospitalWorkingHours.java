package com.hoanglong.healthcare_connect_backend.application.dto.hospital;

import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "hospital_working_hours")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HospitalWorkingHours {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    Hospital hospital;

    @Column(name = "day_of_week", nullable = false)
    Integer dayOfWeek;  // 2=Thứ 3, 3=Thứ 4, 4=Thứ 5, 5=Thứ 6, 6=Thứ 7, 7=Chủ nhật, 8=Thứ 2

    @Column(name = "start_time", nullable = false)
    LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    LocalTime endTime;

    @Column(name = "lunch_start")
    LocalTime lunchStart;

    @Column(name = "lunch_end")
    LocalTime lunchEnd;

    @Column(name = "min_slot_minutes")
    @Builder.Default
    Integer minSlotMinutes = 15;

    @Column(name = "max_slot_minutes")
    @Builder.Default
    Integer maxSlotMinutes = 120;

    @Column(name = "is_active")
    @Builder.Default
    Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}