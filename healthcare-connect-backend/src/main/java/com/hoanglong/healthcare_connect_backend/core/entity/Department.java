package com.hoanglong.healthcare_connect_backend.core.entity;

import com.hoanglong.healthcare_connect_backend.core.constant.MedicalCategory;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity
@Table(name = "departments")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Hibernate sẽ tự hiểu và phối hợp với Postgres
    private UUID id; // "K01", "K02" hoặc dùng UUID

    @Column(nullable = false, unique = true)
    String code;

    @Column(unique = true, nullable = false)
    String name;

    @Enumerated(EnumType.STRING) // Lưu dưới dạng TEXT (NỘI_KHOA)
    MedicalCategory category;

    @Column(name = "hospital_id")
    UUID hospitalId;

    String description;
}