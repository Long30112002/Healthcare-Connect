package com.hoanglong.healthcare_connect_backend.application.dto.medicine;

import com.hoanglong.healthcare_connect_backend.core.constant.MedicalRecordStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class MedicalRecordResponse {

    UUID id;
    UUID appointmentId;

    // Patient info
    UUID patientId;
    String patientName;
    String patientPhone;
    String patientEmail;

    // Doctor info
    UUID doctorId;
    String doctorName;
    String doctorCode;

    // Hospital info
    UUID hospitalId;
    String hospitalName;
    String hospitalAddress;

    // Medical record content
    String diagnosis;
    String symptoms;
    String notes;
    VitalSignsDto vitalSigns;
    LocalDate followUpDate;
    MedicalRecordStatus status;

    // Prescriptions
    List<PrescriptionDto> prescriptions;
    Integer prescriptionCount;

    // Timestamps
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    @Data
    @Builder
    public static class VitalSignsDto {
        String bloodPressure;
        Integer heartRate;
        BigDecimal temperature;
        BigDecimal weight;
        BigDecimal height;
        BigDecimal bmi;
        String note;
    }

    @Data
    @Builder
    public static class PrescriptionDto {
        UUID id;
        LocalDate prescriptionDate;
        String note;
        Double totalAmount;
        String status;
        LocalDate validUntil;
        boolean isValid;
        List<PrescriptionItemDto> items;
    }

    @Data
    @Builder
    public static class PrescriptionItemDto {
        UUID id;
        UUID medicineId;
        String medicineName;
        String medicineCode;
        String medicineUnit;
        Integer quantity;
        String dosage;
        String frequency;
        Integer duration;
        String instructions;
        Double unitPrice;
        Double totalPrice;
    }
}