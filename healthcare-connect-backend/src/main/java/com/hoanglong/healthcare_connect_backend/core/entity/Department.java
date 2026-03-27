package com.hoanglong.healthcare_connect_backend.core.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity
@Table(name = "departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Hibernate sẽ tự hiểu và phối hợp với Postgres
    private UUID id; // "K01", "K02" hoặc dùng UUID

    @Column(unique = true, nullable = false)
    String name;

    String description;
}