package com.hoanglong.healthcare_connect_backend.application.dto.medicine;

import com.hoanglong.healthcare_connect_backend.core.constant.DosageForm;
import com.hoanglong.healthcare_connect_backend.core.constant.MedicineCategory;
import com.hoanglong.healthcare_connect_backend.core.constant.Unit;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class MedicineResponse {

    UUID id;
    String code;
    String name;
    String activeIngredient;
    MedicineCategory category;
    String categoryDisplayName;
    DosageForm dosageForm;
    String dosageFormDisplayName;
    Unit unit;
    BigDecimal price;
    String formattedPrice;
    Integer stockQuantity;
    Integer minStock;
    Integer maxStock;
    boolean lowStock;
    LocalDate expiryDate;
    boolean expired;
    String manufacturer;
    String manufacturerCountry;
    boolean requiresPrescription;
    String contraindications;
    String sideEffects;
    String description;
    String usageInstructions;

    // Hospital info
    UUID hospitalId;
    String hospitalName;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}