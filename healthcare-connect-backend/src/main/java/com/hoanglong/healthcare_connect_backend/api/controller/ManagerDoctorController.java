package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.ReceptionistListResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.RejectDoctorRequest;
import com.hoanglong.healthcare_connect_backend.application.mapper.ReceptionistMapper;
import com.hoanglong.healthcare_connect_backend.application.service.DoctorService;
import com.hoanglong.healthcare_connect_backend.application.service.ReceptionistService;
import com.hoanglong.healthcare_connect_backend.application.usecase.ApproveDoctorUseCase;
import com.hoanglong.healthcare_connect_backend.application.usecase.RejectDoctorUseCase;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.entity.Receptionist;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IHospitalRepository;
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
    private final IHospitalRepository hospitalRepository;
    private final ReceptionistService receptionistService;
    private final ReceptionistMapper receptionistMapper;
    private final ReceptionistRepository receptionistRepository;

    @GetMapping
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<Page<ReceptionistListResponse>> getReceptionistsByHospital(
            @RequestParam(required = false) ReceptionistStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        // Lấy hospitalId của manager hiện tại
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Hospital hospital = hospitalRepository.findByManagerId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.MANAGER_NO_HOSPITAL));

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<ReceptionistListResponse> receptionists = receptionistService.getReceptionistsByHospital(
                hospital.getId(), status, keyword, pageable);

        return ApiResponse.<Page<ReceptionistListResponse>>builder()
                .status("success")
                .code(200)
                .data(receptionists)
                .build();
    }

    @GetMapping("/{receptionistId}")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<ReceptionistListResponse> getReceptionistDetail(@PathVariable UUID receptionistId) {
        // Cần thêm method getById trong service
        Receptionist receptionist = receptionistRepository.findById(receptionistId)
                .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NOT_FOUND));

        return ApiResponse.<ReceptionistListResponse>builder()
                .status("success")
                .code(200)
                .data(receptionistMapper.toListResponse(receptionist))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<DoctorResponse> getDoctorForManager(@PathVariable UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<DoctorResponse>builder()
                .data(doctorService.getDoctorForManager(id, currentUserId))
                .build();
    }

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
