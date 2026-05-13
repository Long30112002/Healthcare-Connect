package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.DoctorProfileRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.PublicDoctorDetailResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.doctor.PublicDoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.service.DoctorService;
import com.hoanglong.healthcare_connect_backend.application.service.PublicDoctorService;
import com.hoanglong.healthcare_connect_backend.application.service.ScheduleService;
import com.hoanglong.healthcare_connect_backend.application.usecase.RegisterDoctorProfileUseCase;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/doctors")
@RequiredArgsConstructor
@Slf4j
public class PublicDoctorController
{
    private final RegisterDoctorProfileUseCase registerDoctorProfileUseCase;
    private final DoctorService doctorService;
    private final PublicDoctorService publicDoctorService;

    @GetMapping
    @PreAuthorize("permitAll()")
    public ApiResponse<Page<PublicDoctorResponse>> getPublicDoctors(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID specialtyId,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "u.fullName") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        log.info("API: Lấy danh sách bác sĩ public - page: {}, size: {}, keyword: {}", page, size, keyword);

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<PublicDoctorResponse> doctors = publicDoctorService.getPublicDoctors(keyword, specialtyId, hospitalId, pageable);

        return ApiResponse.<Page<PublicDoctorResponse>>builder()
                .status("success")
                .code(200)
                .message("Lấy danh sách bác sĩ thành công!")
                .data(doctors)
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ApiResponse<PublicDoctorDetailResponse> getPublicDoctorDetail(@PathVariable UUID id) {
        log.info("API: Lấy chi tiết bác sĩ public: {}", id);

        PublicDoctorDetailResponse doctor = publicDoctorService.getPublicDoctorDetail(id);

        return ApiResponse.<PublicDoctorDetailResponse>builder()
                .status("success")
                .code(200)
                .message("Lấy chi tiết bác sĩ thành công!")
                .data(doctor)
                .build();
    }

    @PostMapping(value = "/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<DoctorResponse> apply(@ModelAttribute @Valid DoctorProfileRequest request, HttpServletRequest httpRequest) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<DoctorResponse>builder()
                .status("success")
                .message("Hồ sơ đã được gửi kèm CV!")
                .data(registerDoctorProfileUseCase.execute(userId, request, httpRequest))
                .build();
    }

    @GetMapping("/public/{id}")
    public ApiResponse<DoctorResponse> getPublicDoctorById(@PathVariable UUID id) {
        return ApiResponse.<DoctorResponse>builder()
                .data(doctorService.getPublicDoctorById(id))
                .build();
    }

    @GetMapping("/me")
    public ApiResponse<DoctorResponse> getMyDoctorProfile() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Doctor doctor = doctorService.getDoctorEntityByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));
        return ApiResponse.<DoctorResponse>builder()
                .data(doctorService.getDoctorProfileForSelf(doctor.getId(), currentUserId))
                .build();
    }
}