package com.hoanglong.healthcare_connect_backend.api.controller;


import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.receptionist.ReceptionistListResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.receptionist.ReceptionistResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.receptionist.RejectReceptionistRequest;
import com.hoanglong.healthcare_connect_backend.application.mapper.ReceptionistMapper;
import com.hoanglong.healthcare_connect_backend.application.service.ReceptionistService;
import com.hoanglong.healthcare_connect_backend.application.usecase.ApproveReceptionistUseCase;
import com.hoanglong.healthcare_connect_backend.application.usecase.RejectReceptionistUseCase;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Receptionist;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReceptionistRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/receptionist")
@RequiredArgsConstructor
public class AdminReceptionController
{
    private final ApproveReceptionistUseCase approveReceptionistUseCase;
    private final RejectReceptionistUseCase rejectReceptionistUseCase;
    private final ReceptionistService receptionistService;
    private final ReceptionistRepository receptionistRepository;
    private final ReceptionistMapper receptionistMapper;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Page<ReceptionistListResponse>> getAllReceptionists(
            @RequestParam(required = false) ReceptionistStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<ReceptionistListResponse> receptionists = receptionistService.getAllReceptionists(status, keyword, pageable);

        return ApiResponse.<Page<ReceptionistListResponse>>builder()
                .status("success")
                .code(200)
                .data(receptionists)
                .build();
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportReceptionists(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String hospitalId
    ) {
        byte[] excelData = receptionistService.exportReceptionistsToExcel(keyword, status, hospitalId);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=receptionists_" +
                        LocalDate.now() + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelData);
    }

    @GetMapping("/{receptionistId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ReceptionistResponse> getReceptionistDetail(@PathVariable UUID receptionistId) {
        // Đổi từ ReceptionistListResponse → ReceptionistResponse

        Receptionist receptionist = receptionistRepository.findById(receptionistId)
                .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NOT_FOUND));

        return ApiResponse.<ReceptionistResponse>builder()  // ← Đổi ở đây
                .status("success")
                .code(200)
                .data(receptionistMapper.toResponse(receptionist))  // ← Đổi thành toResponse
                .build();
    }

    @PatchMapping("/{receptionistId}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> verify(
            @PathVariable UUID receptionistId,
            HttpServletRequest httpRequest) {

        approveReceptionistUseCase.execute(receptionistId, httpRequest);

        return ApiResponse.<Void>builder()
                .status("success")
                .code(200)
                .message("Xác thực hồ sơ lễ tân thành công!")
                .build();
    }

    @PostMapping("/{receptionistId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> reject(
            @PathVariable UUID receptionistId,
            @RequestBody @Valid RejectReceptionistRequest request,
            HttpServletRequest httpRequest) {

        rejectReceptionistUseCase.execute(receptionistId, request, httpRequest);

        return ApiResponse.<Void>builder()
                .status("success")
                .code(200)
                .message("Đã từ chối hồ sơ lễ tân thành công!")
                .build();
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ReceptionistListResponse>> getPendingReceptionists() {
        List<Receptionist> receptionists = receptionistRepository.findByStatus(ReceptionistStatus.PENDING);
        List<ReceptionistListResponse> response = receptionists.stream()
                .map(receptionistMapper::toListResponse)
                .collect(Collectors.toList());

        return ApiResponse.<List<ReceptionistListResponse>>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .data(response)
                .build();
    }
}
