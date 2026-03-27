package com.hoanglong.healthcare_connect_backend.core.entity;

import com.hoanglong.healthcare_connect_backend.core.constant.MedicalCategory;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "specialties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Specialty {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false, unique = true)
    String code;

    @Column(nullable = false, unique = true)
    String name;

    @Enumerated(EnumType.STRING)
    private MedicalCategory category;

    String description;

    @ManyToOne(fetch = FetchType.LAZY) // Chỉ load Department khi cần thiết để tăng hiệu năng
    @JoinColumn(name = "department_id", nullable = false)
    Department department;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
}