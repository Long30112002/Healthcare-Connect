package com.hoanglong.healthcare_connect_backend.application.dto.medicine;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordRequest {

    @NotNull(message = "APPOINTMENT_ID_REQUIRED")
    UUID appointmentId;

    @NotBlank(message = "DIAGNOSIS_REQUIRED")
    @Size(min = 3, max = 500, message = "DIAGNOSIS_LENGTH_INVALID")
    String diagnosis;

    @Size(max = 500, message = "SYMPTOMS_TOO_LONG")
    String symptoms;

    @Size(max = 2000, message = "NOTES_TOO_LONG")
    String notes;

    @Valid
    VitalSignsDTO vitalSigns;

    @FutureOrPresent(message = "FOLLOW_UP_DATE_INVALID")
    LocalDate followUpDate;

    @Valid
    @Builder.Default
    List<PrescriptionDTO> prescriptions = new ArrayList<>();

    @Data
    public static class VitalSignsDTO {
        @Pattern(regexp = "^\\d{2,3}/\\d{2,3}$", message = "BLOOD_PRESSURE_INVALID")
        String bloodPressure;  // VD: "120/80"

        @Min(value = 30, message = "HEART_RATE_TOO_LOW")
        @Max(value = 200, message = "HEART_RATE_TOO_HIGH")
        Integer heartRate;

        @DecimalMin(value = "34.0", message = "TEMPERATURE_TOO_LOW")
        @DecimalMax(value = "42.0", message = "TEMPERATURE_TOO_HIGH")
        BigDecimal temperature;

        @DecimalMin(value = "2.0", message = "WEIGHT_TOO_LOW")
        @DecimalMax(value = "300.0", message = "WEIGHT_TOO_HIGH")
        BigDecimal weight;

        @DecimalMin(value = "30.0", message = "HEIGHT_TOO_LOW")
        @DecimalMax(value = "250.0", message = "HEIGHT_TOO_HIGH")
        BigDecimal height;

        BigDecimal bmi;  // Có thể tính tự động
        String note;
    }

    @Data
    public static class PrescriptionDTO {
        @Size(max = 500, message = "PRESCRIPTION_NOTE_TOO_LONG")
        String note;

        @NotEmpty(message = "PRESCRIPTION_ITEMS_EMPTY")
        @Valid
        List<PrescriptionItemDTO> items;

        LocalDate validUntil;  // Đơn thuốc có hiệu lực đến
    }

    @Data
    public static class PrescriptionItemDTO {
        @NotNull(message = "MEDICINE_ID_REQUIRED")
        UUID medicineId;

        @NotNull(message = "QUANTITY_REQUIRED")
        @Min(value = 1, message = "QUANTITY_MIN")
        @Max(value = 1000, message = "QUANTITY_MAX")
        Integer quantity;

        @NotBlank(message = "DOSAGE_REQUIRED")
        @Size(max = 100, message = "DOSAGE_TOO_LONG")
        String dosage;  // VD: "2 viên/lần"

        @Size(max = 100, message = "FREQUENCY_TOO_LONG")
        String frequency;  // VD: "3 lần/ngày"

        @Min(value = 1, message = "DURATION_MIN")
        @Max(value = 365, message = "DURATION_MAX")
        Integer duration;  // Số ngày

        @Size(max = 500, message = "INSTRUCTIONS_TOO_LONG")
        String instructions;
    }
}