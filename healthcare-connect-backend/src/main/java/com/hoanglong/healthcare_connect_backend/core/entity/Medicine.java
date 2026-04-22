package com.hoanglong.healthcare_connect_backend.core.entity;

import com.hoanglong.healthcare_connect_backend.core.constant.DosageForm;
import com.hoanglong.healthcare_connect_backend.core.constant.MedicineCategory;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medicines")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(unique = true, nullable = false, length = 50)
    String code;

    @Column(nullable = false, length = 255)
    String name;

    @Column(name = "active_ingredient", columnDefinition = "TEXT")
    String activeIngredient;  // Hoạt chất

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    MedicineCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "dosage_form")
    DosageForm dosageForm;  // Dạng bào chế

    String unit;  // Đơn vị (viên, chai, ống...)

    @Column(precision = 19, scale = 2)
    BigDecimal price;

    @Column(name = "stock_quantity")
    @Builder.Default
    Integer stockQuantity = 0;

    @Column(name = "min_stock")
    @Builder.Default
    Integer minStock = 10;  // Ngưỡng cảnh báo tồn kho

    @Column(name = "max_stock")
    Integer maxStock;  // Tối đa có thể nhập

    @Column(name = "expiry_date")
    LocalDate expiryDate;  // Hạn sử dụng

    @Column(name = "manufacturer", length = 255)
    String manufacturer;  // Nhà sản xuất

    @Column(name = "manufacturer_country", length = 100)
    String manufacturerCountry;  // Nước sản xuất

    @Column(name = "requires_prescription")
    @Builder.Default
    Boolean requiresPrescription = true;  // Thuốc kê đơn

    @Column(columnDefinition = "TEXT")
    String contraindications;  // Chống chỉ định

    @Column(name = "side_effects", columnDefinition = "TEXT")
    String sideEffects;  // Tác dụng phụ

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name = "usage_instructions", columnDefinition = "TEXT")
    String usageInstructions;  // Hướng dẫn sử dụng

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id")
    Hospital hospital;

    @Column(name = "deleted")
    @Builder.Default
    boolean deleted = false;

    @Version
    @Builder.Default
    Long version = 0L;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        if (stockQuantity == null) stockQuantity = 0;
        if (minStock == null) minStock = 10;
        if (requiresPrescription == null) requiresPrescription = true;
    }

    public boolean isLowStock() {
        return stockQuantity != null && minStock != null && stockQuantity <= minStock;
    }

    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDate.now());
    }

    public void softDelete() {
        this.deleted = true;
        this.deletedAt = LocalDateTime.now();
    }
}