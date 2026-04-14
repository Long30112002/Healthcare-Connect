package com.hoanglong.healthcare_connect_backend.core.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "room_number", nullable = false, unique = true)
    String roomNumber;

    @Column(name = "floor")
    Integer floor;

    @Column(name = "building")
    String building;

    @Column(name = "status")
    String status; // AVAILABLE, OCCUPIED, MAINTENANCE

    @Column(name = "current_appointment_id")
    UUID currentAppointmentId;

    @CreationTimestamp
    @Column(name = "created_at")
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "deleted")
    private boolean deleted;
}