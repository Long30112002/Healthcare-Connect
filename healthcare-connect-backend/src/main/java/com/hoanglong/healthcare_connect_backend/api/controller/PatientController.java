package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.DoctorDetailResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.DoctorListResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.VisitedDoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.service.DoctorService;
import com.hoanglong.healthcare_connect_backend.application.service.QRCodeService;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final DoctorService doctorService;
    private final QRCodeService qrCodeService;

    @GetMapping("/visited-doctors")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<List<VisitedDoctorResponse>> getVisitedDoctors() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<List<VisitedDoctorResponse>>builder()
                .status("success")
                .code(200)
                .data(doctorService.getVisitedDoctors(currentUserId))
                .build();
    }

    @GetMapping("/doctors/available")
    public ApiResponse<List<DoctorListResponse>> getAvailableDoctors(
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) Integer days
    ) {
        return ApiResponse.<List<DoctorListResponse>>builder()
                .status("success")
                .code(200)
                .data(doctorService.getAvailableDoctors(date, days))
                .build();
    }

    @GetMapping("/doctors/{doctorId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<DoctorDetailResponse> getDoctorDetail(@PathVariable UUID doctorId) {
        return ApiResponse.<DoctorDetailResponse>builder()
                .status("success")
                .code(200)
                .data(doctorService.getDoctorDetail(doctorId))
                .build();
    }

    @GetMapping("/{appointmentId}/qr-code")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<String> getQRCode(@PathVariable UUID appointmentId) {
        String qrCode = qrCodeService.generateQRCodeBase64(appointmentId.toString());
        return ApiResponse.<String>builder()
                .status("success")
                .code(200)
                .data(qrCode)
                .build();
    }
}