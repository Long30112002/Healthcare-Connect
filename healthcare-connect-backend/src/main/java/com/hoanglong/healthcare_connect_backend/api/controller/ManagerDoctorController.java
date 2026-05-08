package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.receptionist.ReceptionistListResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.RejectDoctorRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager.DoctorDetailForManagerResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.ReceptionistMapper;
import com.hoanglong.healthcare_connect_backend.application.service.CurrentUserService;
import com.hoanglong.healthcare_connect_backend.application.service.DoctorService;
import com.hoanglong.healthcare_connect_backend.application.service.ReceptionistService;
import com.hoanglong.healthcare_connect_backend.application.usecase.ApproveDoctorUseCase;
import com.hoanglong.healthcare_connect_backend.application.usecase.RejectDoctorUseCase;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.entity.Receptionist;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.HospitalRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReceptionistRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/manager/doctors")
@RequiredArgsConstructor
public class ManagerDoctorController
{
    private final ApproveDoctorUseCase approveDoctorUseCase;
    private final RejectDoctorUseCase rejectDoctorUseCase;
    private final DoctorService doctorService;
    private final ReceptionistMapper receptionistMapper;
    private final ReceptionistRepository receptionistRepository;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<Page<DoctorResponse>> getDoctorsByManager(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) DoctorStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        // Lấy hospitalId của manager hiện tại
        UUID hospitalId = currentUserService.getCurrentHospitalId();

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        // Gọi method có keyword
        Page<DoctorResponse> doctors = doctorService.getDoctorsByHospital(hospitalId, status, keyword, pageable);

        return ApiResponse.<Page<DoctorResponse>>builder()
                .status("success")
                .code(200)
                .data(doctors)
                .build();
    }

    @GetMapping("/{doctorId}")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<DoctorDetailForManagerResponse> getDoctorDetail(
            @PathVariable UUID doctorId) {

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        DoctorDetailForManagerResponse doctor = doctorService.getDoctorDetailForManager(doctorId, currentUserId);

        return ApiResponse.<DoctorDetailForManagerResponse>builder()
                .status("success")
                .code(200)
                .data(doctor)
                .build();
    }

//    @GetMapping("/{id}")
//    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
//    public ApiResponse<DoctorResponse> getDoctorForManager(@PathVariable UUID id) {
//        UUID currentUserId = SecurityUtils.getCurrentUserId();
//        return ApiResponse.<DoctorResponse>builder()
//                .data(doctorService.getDoctorForManager(id, currentUserId))
//                .build();
//    }

    @GetMapping("/inHospital")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<List<DoctorResponse>> getAllDoctorsInMyHospital() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<List<DoctorResponse>>builder()
                .data(doctorService.getAllDoctorsByManager(currentUserId))
                .build();
    }

    @GetMapping("/pending-approval")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<List<DoctorResponse>> getVerifiedDoctorsForManager() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<List<DoctorResponse>>builder()
                .data(doctorService.getVerifiedDoctorsByManager(currentUserId))
                .build();
    }

    @PatchMapping("/{doctorId}/approve")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<String> approve(@PathVariable UUID doctorId, HttpServletRequest httpRequest) {
        approveDoctorUseCase.execute(doctorId, httpRequest);
        return ApiResponse.<String>builder().data("Phê duyệt hồ sơ thành công.").build();
    }

    @PostMapping("/{doctorId}/reject")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<Void> reject(@PathVariable UUID doctorId, @RequestBody @Valid RejectDoctorRequest request, HttpServletRequest httpRequest) {
        rejectDoctorUseCase.execute(doctorId, request, httpRequest);
        return ApiResponse.<Void>builder()
                .message("Đã từ chối hồ sơ bác sĩ thành công.")
                .build();
    }
}
