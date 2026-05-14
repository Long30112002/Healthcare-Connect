package com.hoanglong.healthcare_connect_backend.core.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "system_configs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

public class SystemConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "config_key", nullable = false, unique = true, length = 255)
    String configKey;

    @Column(name = "config_value", columnDefinition = "TEXT")
    String configValue;

    @Column(name = "config_type", length = 50)
    @Builder.Default
    String configType = "TEXT"; // TEXT, IMAGE, JSON, COLOR, HTML

    @Column(name = "group_name", length = 100)
    @Builder.Default
    String groupName = "GENERAL";

    @Column(name = "display_name", length = 255)
    String displayName;

    @Column(name = "description", length = 500)
    String description;

    @Column(name = "display_order")
    @Builder.Default
    Integer displayOrder = 0;

    @Column(name = "is_active")
    @Builder.Default
    Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "updated_by")
    UUID updatedBy;
}