package com.hoanglong.healthcare_connect_backend.application.dto.medicine;

import com.hoanglong.healthcare_connect_backend.core.constant.DosageForm;
import com.hoanglong.healthcare_connect_backend.core.constant.MedicineCategory;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class MedicineRequest {

    @NotBlank(message = "MEDICINE_CODE_REQUIRED")
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "MEDICINE_CODE_INVALID")
    private String code;

    @NotBlank(message = "MEDICINE_NAME_REQUIRED")
    @Size(min = 2, max = 255, message = "MEDICINE_NAME_INVALID")
    private String name;

    @NotBlank(message = "ACTIVE_INGREDIENT_REQUIRED")
    private String activeIngredient;

    @NotNull(message = "CATEGORY_REQUIRED")
    private MedicineCategory category;

    private DosageForm dosageForm;

    @NotBlank(message = "UNIT_REQUIRED")
    private String unit;

    @NotNull(message = "PRICE_REQUIRED")
    @Positive(message = "PRICE_POSITIVE")
    private BigDecimal price;

    @PositiveOrZero(message = "STOCK_QUANTITY_INVALID")
    private Integer stockQuantity;

    @PositiveOrZero(message = "MIN_STOCK_INVALID")
    private Integer minStock;

    @PositiveOrZero(message = "MAX_STOCK_INVALID")
    private Integer maxStock;

    @Future(message = "EXPIRY_DATE_FUTURE")
    private LocalDate expiryDate;

    private String manufacturer;
    private String manufacturerCountry;

    private Boolean requiresPrescription;

    private String contraindications;
    private String sideEffects;
    private String description;
    private String usageInstructions;

    @NotNull(message = "HOSPITAL_ID_REQUIRED")
    private UUID hospitalId;
}
