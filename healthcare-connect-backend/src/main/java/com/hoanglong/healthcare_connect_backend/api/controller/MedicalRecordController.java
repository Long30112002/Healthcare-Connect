package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.medicine.MedicalRecordRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.medicine.MedicalRecordResponse;
import com.hoanglong.healthcare_connect_backend.application.service.MedicalRecordService;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
@Slf4j
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<MedicalRecordResponse> createMedicalRecord(
            @Valid @RequestBody MedicalRecordRequest request
    ) {
        log.info("API: Tạo bệnh án cho appointment: {}", request.getAppointmentId());

        MedicalRecordResponse response = medicalRecordService.createMedicalRecord(request);

        return ApiResponse.<MedicalRecordResponse>builder()
                .status("success")
                .code(HttpStatus.CREATED.value())
                .message("Tạo bệnh án thành công!")
                .data(response)
                .build();
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT', 'HOSPITAL_MANAGER', 'RECEPTIONIST', 'ADMIN')")
    public ApiResponse<MedicalRecordResponse> getByAppointmentId(
            @PathVariable UUID appointmentId
    ) {
        log.info("API: Lấy bệnh án theo appointment: {}", appointmentId);

        MedicalRecordResponse response = medicalRecordService.getByAppointmentId(appointmentId);

        return ApiResponse.<MedicalRecordResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy bệnh án thành công!")
                .data(response)
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT', 'HOSPITAL_MANAGER', 'RECEPTIONIST', 'ADMIN')")
    public ApiResponse<MedicalRecordResponse> getById(@PathVariable UUID id) {
        log.info("API: Lấy bệnh án theo ID: {}", id);

        // TODO: Thêm method getById vào service
//MedicalRecordResponse response = medicalRecordService.getByAppointmentId(id);
        MedicalRecordResponse response = medicalRecordService.getById(id);

        return ApiResponse.<MedicalRecordResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy bệnh án thành công!")
                .data(response)
                .build();
    }

    @GetMapping("/my-records")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<List<MedicalRecordResponse>> getMyMedicalRecords() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        log.info("API: Lấy bệnh án của bệnh nhân: {}", currentUserId);

        List<MedicalRecordResponse> responses = medicalRecordService.getByPatientId(currentUserId);

        return ApiResponse.<List<MedicalRecordResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách bệnh án thành công!")
                .data(responses)
                .build();
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'HOSPITAL_MANAGER', 'ADMIN')")
    public ApiResponse<List<MedicalRecordResponse>> getByPatientId(
            @PathVariable UUID patientId
    ) {
        log.info("API: Lấy bệnh án của bệnh nhân: {}", patientId);

        List<MedicalRecordResponse> responses = medicalRecordService.getByPatientId(patientId);

        return ApiResponse.<List<MedicalRecordResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách bệnh án thành công!")
                .data(responses)
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<MedicalRecordResponse> updateMedicalRecord(
            @PathVariable UUID id,
            @Valid @RequestBody MedicalRecordRequest request
    ) {
        log.info("API: Cập nhật bệnh án ID: {}", id);

        MedicalRecordResponse response = medicalRecordService.updateMedicalRecord(id, request);

        return ApiResponse.<MedicalRecordResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Cập nhật bệnh án thành công!")
                .data(response)
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ApiResponse<Void> deleteMedicalRecord(@PathVariable UUID id) {
        log.info("API: Xóa bệnh án ID: {}", id);

        medicalRecordService.deleteMedicalRecord(id);

        return ApiResponse.<Void>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Xóa bệnh án thành công!")
                .build();
    }
}