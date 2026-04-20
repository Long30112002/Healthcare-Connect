package com.hoanglong.healthcare_connect_backend.core.entity;

import com.hoanglong.healthcare_connect_backend.core.constant.RoomStatus;
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

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    RoomStatus status; // AVAILABLE, OCCUPIED, MAINTENANCE

    @CreationTimestamp
    @Column(name = "created_at")
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "deleted")
    boolean deleted;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id")
    Hospital hospital;
}