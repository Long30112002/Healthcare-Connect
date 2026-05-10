package com.hoanglong.healthcare_connect_backend.application.dto.medicine;

import com.hoanglong.healthcare_connect_backend.core.constant.DosageForm;
import com.hoanglong.healthcare_connect_backend.core.constant.MedicineCategory;
import com.hoanglong.healthcare_connect_backend.core.constant.Unit;
import jakarta.validation.constraints.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MedicineRequest {

    @NotBlank(message = "MEDICINE_CODE_REQUIRED")
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "MEDICINE_CODE_INVALID")
    String code;

    @NotBlank(message = "MEDICINE_NAME_REQUIRED")
    @Size(min = 2, max = 255, message = "MEDICINE_NAME_INVALID")
    String name;

    @NotBlank(message = "ACTIVE_INGREDIENT_REQUIRED")
    String activeIngredient;

    @NotNull(message = "CATEGORY_REQUIRED")
    MedicineCategory category;

    DosageForm dosageForm;

    @NotNull(message = "UNIT_REQUIRED")
    Unit unit;

    @NotNull(message = "PRICE_REQUIRED")
    @Positive(message = "PRICE_POSITIVE")
    BigDecimal price;

    @PositiveOrZero(message = "STOCK_QUANTITY_INVALID")
    Integer stockQuantity;

    @PositiveOrZero(message = "MIN_STOCK_INVALID")
    Integer minStock;

    @PositiveOrZero(message = "MAX_STOCK_INVALID")
    Integer maxStock;

    @Future(message = "EXPIRY_DATE_FUTURE")
    LocalDate expiryDate;

    String manufacturer;
    String manufacturerCountry;

    Boolean requiresPrescription;

    String contraindications;
    String sideEffects;
    String description;
    String usageInstructions;
}
