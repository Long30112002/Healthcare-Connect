package com.hoanglong.healthcare_connect_backend.application.dto.patient;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PatientResponse {
    UUID patientId;
    UUID appointmentId;     // Cho walk-in (lấy appointment.id)
    String patientName;
    String patientPhone;
    String patientEmail;
    LocalDateTime lastVisitDate;
    String lastDiagnosis;
    Long totalVisits;
    boolean isWalkIn;
}